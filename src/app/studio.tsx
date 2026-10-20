"use client";

import dynamic from "next/dynamic";
import {
  Box,
  ChevronDown,
  Circle,
  Download,
  Eraser,
  Grid2X2,
  HelpCircle,
  Info,
  Minus,
  MousePointer2,
  Pencil,
  RotateCcw,
  Sparkles,
  Square,
  Triangle,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import TutorialModal from "./components/tutorial-modal";
import { PALETTE, PRESETS } from "./constants/presets";
import { Filter, Matrix, Point, Preset, Shape, Tool, View } from "./types";

const PixelScene = dynamic(() => import("./pixel-scene"), { ssr: false });
const W = 960;
const H = 600;
const COLUMNS = 32;
const ROWS = 20;
const PAPER = "#fffdf8";

const toolOptions = [
  ["select", "Selecionar", MousePointer2, "Cursor de seleção e inspeção"],
  ["pen", "Lápis", Pencil, "Desenho contínuo à mão livre"],
  ["line", "Linha", Minus, "Segmento de reta entre dois pontos"],
  ["rect", "Retângulo", Square, "Forma retangular proporcional"],
  ["circle", "Círculo", Circle, "Forma circular a partir do centro"],
  ["polygon", "Polígono", Triangle, "Polígono com múltiplos vértices"],
  ["eraser", "Borracha", Eraser, "Apaga partes do desenho"],
] as const;

const filterOptions: { id: Filter; name: string; desc: string; math: string }[] = [
  { id: "original", name: "Original", desc: "Cores puras da paleta rasterizada", math: "Matriz bruta" },
  { id: "grayscale", name: "Cinza", desc: "Luminância perceptual humana", math: "0.299R + 0.587G + 0.114B" },
  { id: "blur", name: "Desfoque", desc: "Suavização pela média dos vizinhos", math: "Convolução 3×3" },
  { id: "edges", name: "Bordas", desc: "Gradiente de contraste (Sobel)", math: "√((Δx)² + (Δy)²)" },
];

function paintShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  if (!shape.points.length) return;
  const first = shape.points[0];
  const last = shape.points.at(-1)!;
  ctx.save();
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  if (shape.type === "path" || shape.type === "polygon") {
    ctx.moveTo(first.x, first.y);
    shape.points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    if (shape.type === "polygon" && shape.points.length > 2) ctx.closePath();
  } else if (shape.type === "line") {
    ctx.moveTo(first.x, first.y);
    ctx.lineTo(last.x, last.y);
  } else if (shape.type === "rect") {
    ctx.strokeRect(first.x, first.y, last.x - first.x, last.y - first.y);
    ctx.restore();
    return;
  } else {
    ctx.arc(first.x, first.y, Math.hypot(last.x - first.x, last.y - first.y), 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.restore();
}

function hexRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
}

function lightness(hex: string | null) {
  if (!hex) return 255;
  const { r, g, b } = hexRgb(hex);
  return r * 0.299 + g * 0.587 + b * 0.114;
}

function processPixels(matrix: Matrix, filter: Filter): Matrix {
  if (filter === "original") return matrix;
  if (filter === "grayscale") {
    return matrix.map((row) =>
      row.map((hex) => {
        if (!hex) return null;
        const level = lightness(hex);
        return toHex(level, level, level);
      })
    );
  }
  return matrix.map((row, y) =>
    row.map((_, x) => {
      if (filter === "edges") {
        const dx = lightness(matrix[y][x - 1] ?? null) - lightness(matrix[y][x + 1] ?? null);
        const dy = lightness(matrix[y - 1]?.[x] ?? null) - lightness(matrix[y + 1]?.[x] ?? null);
        return Math.hypot(dx, dy) > 80 ? PALETTE[1] : null;
      }
      const samples: string[] = [];
      for (let yy = Math.max(0, y - 1); yy <= Math.min(matrix.length - 1, y + 1); yy += 1) {
        for (let xx = Math.max(0, x - 1); xx <= Math.min(row.length - 1, x + 1); xx += 1) {
          const sample = matrix[yy][xx];
          if (sample) samples.push(sample);
        }
      }
      if (!samples.length) return null;
      const average = samples
        .map(hexRgb)
        .reduce(
          (sum, rgb) => ({
            r: sum.r + rgb.r / samples.length,
            g: sum.g + rgb.g / samples.length,
            b: sum.b + rgb.b / samples.length,
          }),
          { r: 0, g: 0, b: 0 }
        );
      return toHex(average.r, average.g, average.b);
    })
  );
}

export default function Studio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shapes, setShapes] = useState<Shape[]>(PRESETS[0].shapes);
  const [currentProjectName, setCurrentProjectName] = useState(PRESETS[0].name);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [width, setWidth] = useState(6);
  const [view, setView] = useState<View>("draw");
  const [filter, setFilter] = useState<Filter>("original");
  const [draft, setDraft] = useState<Shape | null>(null);
  const [vertices, setVertices] = useState<Point[]>([]);
  const [matrix, setMatrix] = useState<Matrix>([]);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Check on mount if tutorial has been seen before
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const seen = localStorage.getItem("traco_pixel_tutorial_seen");
        if (!seen) {
          setIsTutorialOpen(true);
        }
      } catch {
        // storage disabled or blocked
      }
    }
  }, []);

  // Close presets dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".project-presets-wrapper")) {
        setIsPresetsOpen(false);
      }
    }
    if (isPresetsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isPresetsOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    shapes.forEach((shape) => paintShape(ctx, shape));
    if (draft) paintShape(ctx, draft);
    if (vertices.length) paintShape(ctx, { id: -1, type: "polygon", points: vertices, color, width });

    const data = ctx.getImageData(0, 0, W, H).data;
    const result: Matrix = [];
    const cellWidth = W / COLUMNS;
    const cellHeight = H / ROWS;
    for (let row = 0; row < ROWS; row += 1) {
      const cells: (string | null)[] = [];
      for (let column = 0; column < COLUMNS; column += 1) {
        let r = 0, g = 0, b = 0;
        for (let y = row * cellHeight; y < (row + 1) * cellHeight; y += 1) {
          for (let x = column * cellWidth; x < (column + 1) * cellWidth; x += 1) {
            const index = (y * W + x) * 4;
            r += data[index];
            g += data[index + 1];
            b += data[index + 2];
          }
        }
        const area = cellWidth * cellHeight;
        const avg = { r: r / area, g: g / area, b: b / area };
        cells.push(Math.min(avg.r, avg.g, avg.b) < 248 ? toHex(avg.r, avg.g, avg.b) : null);
      }
      result.push(cells);
    }
    setMatrix(result);
  }, [color, draft, vertices, shapes, width]);

  const output = useMemo(() => processPixels(matrix, filter), [matrix, filter]);
  const activePixels = output.flat().filter(Boolean).length;

  function locate(event: ReactPointerEvent<HTMLCanvasElement>): Point {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * W,
      y: ((event.clientY - bounds.top) / bounds.height) * H,
    };
  }

  function pointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (tool === "select") return;
    const point = locate(event);
    if (tool === "polygon") {
      setVertices((current) => [...current, point]);
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    const type = tool === "pen" || tool === "eraser" ? "path" : tool;
    setDraft({
      id: Date.now(),
      type,
      points: [point],
      color: tool === "eraser" ? PAPER : color,
      width: tool === "eraser" ? width * 3 : width,
    });
  }

  function pointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!draft) return;
    const point = locate(event);
    setDraft((current) =>
      current && {
        ...current,
        points: current.type === "path" ? [...current.points, point] : [current.points[0], point],
      }
    );
  }

  function pointerUp() {
    if (draft) {
      setShapes((current) => [...current, draft]);
      setDraft(null);
      setCurrentProjectName("Desenho Personalizado");
    }
  }

  function closePolygon() {
    if (vertices.length < 3) return;
    setShapes((current) => [
      ...current,
      { id: Date.now(), type: "polygon", points: vertices, color, width },
    ]);
    setVertices([]);
    setCurrentProjectName("Desenho Personalizado");
  }

  function handleSelectPreset(preset: Preset) {
    setShapes(preset.shapes);
    setVertices([]);
    setCurrentProjectName(preset.name);
    setIsPresetsOpen(false);
  }

  function exportCanvas() {
    const link = document.createElement("a");
    link.download = `traco-pixel-${currentProjectName.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvasRef.current?.toDataURL("image/png") ?? "";
    link.click();
  }

  const activeToolConfig = toolOptions.find((t) => t[0] === tool);

  return (
    <main className="studio-shell">
      {/* Interactive Onboarding Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onSelectPreset={handleSelectPreset}
        onSwitchView={(v) => setView(v)}
      />

      {/* Main Studio Top Navigation Bar */}
      <header className="topbar">
        <div className="brand-group">
          <a className="brand" href="#workspace" aria-label="Início de Traço e Pixel">
            <span className="brand-mark">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>
              traço<span className="brand-light">& pixel</span>
            </span>
          </a>
          <span className="brand-badge-pill">Laboratório de Imagem</span>
        </div>

        {/* Project Name & Preset Selector Dropdown */}
        <div className="project-presets-wrapper">
          <button
            className="project-label-button"
            onClick={() => setIsPresetsOpen((prev) => !prev)}
            aria-expanded={isPresetsOpen}
            aria-haspopup="listbox"
            title="Escolha um modelo pronto ou veja o título do projeto"
          >
            <div className="project-label-text">
              <span className="project-category-kicker">MODELO ATIVO</span>
              <span className="project-name">{currentProjectName}</span>
            </div>
            <ChevronDown size={14} className={`dropdown-chevron ${isPresetsOpen ? "open" : ""}`} />
          </button>

          {isPresetsOpen && (
            <div className="presets-dropdown-menu" role="listbox">
              <div className="dropdown-kicker">MODELOS PRONTOS PARA EXPERIMENTAR</div>
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className={`preset-menu-item ${currentProjectName === preset.name ? "selected" : ""}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <div className="preset-item-info">
                    <div className="preset-item-top">
                      <strong>{preset.name}</strong>
                      {preset.badge && <span className="preset-badge">{preset.badge}</span>}
                    </div>
                    <span className="preset-item-desc">{preset.description}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Top Action Buttons */}
        <div className="top-actions">
          {/* Tutorial / Help Button */}
          <button
            className="tutorial-trigger-button"
            onClick={() => setIsTutorialOpen(true)}
            title="Abrir o tutorial explicativo (Como Usar)"
          >
            <Sparkles size={14} className="sparkle-icon" />
            <span>Como Usar</span>
          </button>

          <span className="top-divider" />

          <button
            className="icon-button"
            title="Desfazer última forma desenhada"
            aria-label="Desfazer última forma"
            onClick={() => setShapes((items) => items.slice(0, -1))}
          >
            <Undo2 size={16} />
          </button>
          <button
            className="icon-button"
            title="Limpar quadro de desenho"
            aria-label="Limpar desenho"
            onClick={() => {
              setShapes([]);
              setVertices([]);
              setCurrentProjectName("Quadro Limpo");
            }}
          >
            <RotateCcw size={15} />
          </button>

          <span className="top-divider" />

          <button className="export-button" onClick={exportCanvas}>
            <Download size={14} /> Exportar
          </button>
        </div>
      </header>

      {/* Stagebar Progress Line */}
      <section className="stagebar" aria-label="Estágios do projeto">
        <div className="stage-heading">
          <span>FLUXO COMPUTACIONAL</span>
          <span className="stage-slash">/</span>
          <span>DISCRETO</span>
        </div>

        <div className="stage-track">
          <button
            className={`stage-step ${view === "draw" ? "active" : ""}`}
            onClick={() => setView("draw")}
          >
            <span className="stage-number">01</span> Vetor (Desenho)
          </button>
          <span className="stage-connector" />
          <button
            className={`stage-step ${view === "pixels" ? "active" : ""}`}
            onClick={() => setView("pixels")}
          >
            <span className="stage-number">02</span> Rasterização
          </button>
          <span className="stage-connector" />
          <button
            className={`stage-step ${view === "3d" ? "active" : ""}`}
            onClick={() => setView("3d")}
          >
            <span className="stage-number">03</span> Voxel 3D
          </button>
        </div>

        <div className="stage-resolution">
          <Grid2X2 size={13} /> Malha: 32 × 20 px
        </div>
      </section>

      {/* Studio Grid Workspace */}
      <div className="workspace-grid" id="workspace">
        {/* Left Toolbar */}
        <aside className="tool-panel">
          <div className="panel-kicker">
            FERRAMENTAS <span>07</span>
          </div>

          <div className="tool-grid">
            {toolOptions.map(([id, label, Icon, tooltip]) => (
              <button
                key={id}
                className={`tool-button ${tool === id ? "selected" : ""}`}
                title={`${label}: ${tooltip}`}
                aria-label={label}
                aria-pressed={tool === id}
                onClick={() => setTool(id)}
              >
                <Icon size={18} strokeWidth={1.8} />
              </button>
            ))}
          </div>

          <div className="active-tool-banner">
            <span className="active-tool-title">{activeToolConfig?.[1]}</span>
            <span className="active-tool-desc">{activeToolConfig?.[3]}</span>
          </div>

          <div className="panel-rule" />

          <div className="panel-kicker">
            TINTA <span>{color.toUpperCase()}</span>
          </div>
          <div className="swatch-row" aria-label="Cor da tinta">
            {PALETTE.map((swatch) => (
              <button
                key={swatch}
                className={`color-swatch ${color === swatch ? "chosen" : ""}`}
                style={{ backgroundColor: swatch }}
                title={`Selecionar cor ${swatch}`}
                aria-label={`Selecionar cor ${swatch}`}
                aria-pressed={color === swatch}
                onClick={() => setColor(swatch)}
              />
            ))}
          </div>

          <div className="panel-rule" />

          <div className="range-heading">
            <span>Espessura do traço</span>
            <output>{width}px</output>
          </div>
          <input
            className="thickness-slider"
            type="range"
            min="2"
            max="18"
            value={width}
            onChange={(event) => setWidth(Number(event.target.value))}
            aria-label="Espessura do traço"
          />

          {tool === "polygon" && (
            <button
              className="finish-polygon"
              disabled={vertices.length < 3}
              onClick={closePolygon}
            >
              <Triangle size={14} /> Fechar polígono <span>({vertices.length} pontos)</span>
            </button>
          )}

          <div className="tool-tip-card">
            <div className="tool-tip-card-header">
              <Info size={13} className="info-icon" />
              <strong>Como Desenhar</strong>
            </div>
            <p>
              {tool === "polygon"
                ? "Clique no quadro para adicionar vértices. Quando tiver 3 ou mais pontos, feche o polígono."
                : tool === "select"
                ? "Escolha Lápis, Linha, Retângulo ou Círculo para desenhar novas formas na folha."
                : tool === "eraser"
                ? "Arraste sobre formas para apagar com a cor de fundo do papel."
                : "Arraste no quadro branco para traçar a forma contínua."}
            </p>
          </div>
        </aside>

        {/* Center Canvas / Artboard */}
        <section className="canvas-panel" aria-label="Prancheta de desenho">
          <div className="canvas-toolbar">
            <div className="view-switch" role="tablist" aria-label="Visualização do desenho">
              {(["draw", "pixels", "3d"] as View[]).map((mode) => (
                <button
                  key={mode}
                  role="tab"
                  aria-selected={view === mode}
                  className={view === mode ? "active" : ""}
                  onClick={() => setView(mode)}
                >
                  {mode === "draw" ? (
                    <Pencil size={13} />
                  ) : mode === "pixels" ? (
                    <Grid2X2 size={13} />
                  ) : (
                    <Box size={13} />
                  )}
                  {mode === "3d" ? "Profundidade 3D" : mode === "pixels" ? "Pixels" : "Desenho Vetorial"}
                </button>
              ))}
            </div>

            <div className="canvas-meta">
              <span className="live-dot" />
              {view === "draw"
                ? "MODO VETOR (CONTÍNUO)"
                : view === "pixels"
                ? "MODO RASTER (32×20 DISCRETO)"
                : "MODO TRIDIMENSIONAL (VOXELS)"}
            </div>
          </div>

          <div className={`artboard ${view !== "draw" ? "artboard-output" : ""}`}>
            {view === "draw" && (
              <>
                <canvas
                  ref={canvasRef}
                  className="drawing-canvas"
                  width={W}
                  height={H}
                  aria-label="Quadro de desenho"
                  onPointerDown={pointerDown}
                  onPointerMove={pointerMove}
                  onPointerUp={pointerUp}
                  onPointerCancel={pointerUp}
                />
                {shapes.length === 0 && !draft && (
                  <div className="empty-canvas-guide">
                    <Sparkles size={20} className="empty-icon" />
                    <strong>Quadro pronto para criar!</strong>
                    <span>Use as ferramentas à esquerda ou selecione um modelo no topo.</span>
                  </div>
                )}
              </>
            )}

            {view === "pixels" && (
              <div
                className="pixel-view"
                style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}
                aria-label="Grade de pixels rasterizados"
              >
                {output.flatMap((row, y) =>
                  row.map((pixel, x) => (
                    <span
                      key={`${y}-${x}`}
                      className="pixel-cell"
                      style={{ backgroundColor: pixel ?? PAPER }}
                    />
                  ))
                )}
              </div>
            )}

            {view === "3d" && (
              <div className="scene-container">
                <PixelScene pixels={output} />
                <div className="scene-interactive-tip">
                  <span>🖱️ Arraste com o botão esquerdo para orbitar a cena 3D</span>
                </div>
              </div>
            )}

            <div className="canvas-caption">
              <span>{currentProjectName.toUpperCase()}</span>
              <span>
                {view === "draw"
                  ? `${shapes.length} FORMAS VETORIAIS`
                  : `${filterOptions.find((item) => item.id === filter)?.name.toUpperCase()} / ${activePixels} PIXELS ATIVOS`}
              </span>
            </div>
          </div>

          <div className="canvas-footer">
            <div className="canvas-footer-left">
              <span>{shapes.length} formas no quadro</span>
              <span className="canvas-footer-sep">·</span>
              <span>Área: {W} × {H} px</span>
            </div>
            <div className="canvas-footer-right">
              <button
                className="open-tutorial-mini-btn"
                onClick={() => setIsTutorialOpen(true)}
              >
                <HelpCircle size={12} /> Entenda a rasterização
              </button>
            </div>
          </div>
        </section>

        {/* Right Inspector & Filter Panel */}
        <aside className="inspector-panel">
          <div className="inspector-title">
            <div>
              <span className="panel-kicker">ANÁLISE DE DADOS</span>
              <h2>Relatório da Matriz</h2>
            </div>
            <span className="report-badge">EM TEMPO REAL</span>
          </div>

          <div className="report-stat">
            <span>Resolução da Grade</span>
            <strong>
              {COLUMNS} <small>×</small> {ROWS}
            </strong>
          </div>
          <div className="report-stat">
            <span>Pixels Ativos</span>
            <strong>{activePixels.toString().padStart(3, "0")}</strong>
          </div>
          <div className="report-stat">
            <span>Ocupação do Quadro</span>
            <strong>
              {((activePixels / (COLUMNS * ROWS)) * 100).toFixed(1)}
              <small>%</small>
            </strong>
          </div>
          <div className="report-stat">
            <span>Formas Vetoriais</span>
            <strong>{shapes.length.toString().padStart(2, "0")}</strong>
          </div>

          <div className="panel-rule" />

          <div className="panel-kicker">
            FILTROS MATEMÁTICOS <span>01—04</span>
          </div>

          <div className="filter-list">
            {filterOptions.map((item, index) => (
              <button
                key={item.id}
                className={`filter-step ${filter === item.id ? "active" : ""}`}
                onClick={() => setFilter(item.id)}
                aria-pressed={filter === item.id}
              >
                <span className="filter-index">0{index + 1}</span>
                <div className="filter-details">
                  <span className="filter-name">{item.name}</span>
                  <span className="filter-subdesc">{item.desc}</span>
                </div>
                <span className="filter-mark" />
              </button>
            ))}
          </div>

          <div className="matrix-preview">
            <div className="matrix-heading">
              <span>AMOSTRA MATRICIAL</span>
              <span>{COLUMNS} × {ROWS}</span>
            </div>
            <div className="matrix-rows" aria-label="Amostra da matriz de pixels">
              {output.slice(3, 8).map((row, y) => (
                <div key={y}>
                  {row.slice(7, 25).map((pixel, x) => (
                    <i key={x} style={{ backgroundColor: pixel ?? "transparent" }} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="educational-card">
            <span className="edu-kicker">CONCEITO DO LABORATÓRIO</span>
            <p>
              A computação gráfica conecta a arte analógica aos números. Cada pixel exibido é um registro em uma matriz bidimensional.
            </p>
          </div>
        </aside>
      </div>

      {/* Bottom Statusbar */}
      <footer className="statusbar">
        <span>
          <span className="status-square" /> TRAÇO & PIXEL <span className="status-separator">/</span> LABORATÓRIO DE COMPUTAÇÃO VISUAL
        </span>
        <div className="statusbar-actions">
          <span>MODELO: {currentProjectName.toUpperCase()}</span>
          <span className="status-separator">·</span>
          <span>ESTADO: RASCUNHO INTERATIVO</span>
        </div>
      </footer>
    </main>
  );
}
