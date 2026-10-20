"use client";

import dynamic from "next/dynamic";
import { Circle, Download, Eraser, Grid2X2, Minus, MousePointer2, Pencil, RotateCcw, Square, Triangle, Undo2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const PixelScene = dynamic(() => import("./pixel-scene"), { ssr: false });
const W = 960;
const H = 600;
const COLUMNS = 32;
const ROWS = 20;
const PAPER = "#fffdf8";
const PALETTE = ["#183b3a", "#e86146", "#e5ae3d", "#438c7e"];

type Tool = "select" | "pen" | "line" | "rect" | "circle" | "polygon" | "eraser";
type View = "draw" | "pixels" | "3d";
type Filter = "original" | "grayscale" | "blur" | "edges";
type Point = { x: number; y: number };
type Shape = { id: number; type: "path" | "line" | "rect" | "circle" | "polygon"; points: Point[]; color: string; width: number };
type Matrix = (string | null)[][];

const initialShapes: Shape[] = [
  { id: 1, type: "rect", points: [{ x: 280, y: 260 }, { x: 680, y: 530 }], color: PALETTE[0], width: 6 },
  { id: 2, type: "polygon", points: [{ x: 245, y: 270 }, { x: 480, y: 82 }, { x: 715, y: 270 }], color: PALETTE[1], width: 7 },
  { id: 3, type: "rect", points: [{ x: 425, y: 375 }, { x: 535, y: 530 }], color: PALETTE[3], width: 6 },
  { id: 4, type: "rect", points: [{ x: 320, y: 325 }, { x: 390, y: 395 }], color: PALETTE[2], width: 6 },
  { id: 5, type: "rect", points: [{ x: 570, y: 325 }, { x: 640, y: 395 }], color: PALETTE[2], width: 6 },
  { id: 6, type: "circle", points: [{ x: 760, y: 150 }, { x: 800, y: 150 }], color: PALETTE[2], width: 6 },
];

const toolOptions = [
  ["select", "Selecionar", MousePointer2], ["pen", "Lápis", Pencil], ["line", "Linha", Minus],
  ["rect", "Retângulo", Square], ["circle", "Círculo", Circle], ["polygon", "Polígono", Triangle], ["eraser", "Borracha", Eraser],
] as const;
const filterOptions: { id: Filter; name: string }[] = [
  { id: "original", name: "Original" }, { id: "grayscale", name: "Cinza" }, { id: "blur", name: "Desfoque" }, { id: "edges", name: "Bordas" },
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
  return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
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
  if (filter === "grayscale") return matrix.map((row) => row.map((hex) => {
    if (!hex) return null;
    const level = lightness(hex);
    return toHex(level, level, level);
  }));
  return matrix.map((row, y) => row.map((_, x) => {
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
    const average = samples.map(hexRgb).reduce((sum, rgb) => ({
      r: sum.r + rgb.r / samples.length, g: sum.g + rgb.g / samples.length, b: sum.b + rgb.b / samples.length,
    }), { r: 0, g: 0, b: 0 });
    return toHex(average.r, average.g, average.b);
  }));
}

export default function Studio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shapes, setShapes] = useState<Shape[]>(initialShapes);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(PALETTE[0]);
  const [width, setWidth] = useState(6);
  const [view, setView] = useState<View>("draw");
  const [filter, setFilter] = useState<Filter>("original");
  const [draft, setDraft] = useState<Shape | null>(null);
  const [vertices, setVertices] = useState<Point[]>([]);
  const [matrix, setMatrix] = useState<Matrix>([]);

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
            r += data[index]; g += data[index + 1]; b += data[index + 2];
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
    return { x: ((event.clientX - bounds.left) / bounds.width) * W, y: ((event.clientY - bounds.top) / bounds.height) * H };
  }
  function pointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (tool === "select") return;
    const point = locate(event);
    if (tool === "polygon") { setVertices((current) => [...current, point]); return; }
    event.currentTarget.setPointerCapture(event.pointerId);
    const type = tool === "pen" || tool === "eraser" ? "path" : tool;
    setDraft({ id: Date.now(), type, points: [point], color: tool === "eraser" ? PAPER : color, width: tool === "eraser" ? width * 3 : width });
  }
  function pointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!draft) return;
    const point = locate(event);
    setDraft((current) => current && ({ ...current, points: current.type === "path" ? [...current.points, point] : [current.points[0], point] }));
  }
  function pointerUp() {
    if (draft) { setShapes((current) => [...current, draft]); setDraft(null); }
  }
  function closePolygon() {
    if (vertices.length < 3) return;
    setShapes((current) => [...current, { id: Date.now(), type: "polygon", points: vertices, color, width }]);
    setVertices([]);
  }
  function exportCanvas() {
    const link = document.createElement("a");
    link.download = "pixel-atelier.png";
    link.href = canvasRef.current?.toDataURL("image/png") ?? "";
    link.click();
  }

  return (
    <main className="studio-shell">
      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="Início de Traço e Pixel"><span className="brand-mark"><i /><i /><i /><i /></span><span>traço<span className="brand-light">& pixel</span></span></a>
        <div className="project-label"><span className="project-name">Estudo de uma casa</span><span className="saved-state"><span /> Rascunho local</span></div>
        <div className="top-actions">
          <button className="icon-button" title="Desfazer última forma" aria-label="Desfazer última forma" onClick={() => setShapes((items) => items.slice(0, -1))}><Undo2 size={17} /></button>
          <button className="icon-button" title="Limpar desenho" aria-label="Limpar desenho" onClick={() => { setShapes([]); setVertices([]); }}><RotateCcw size={16} /></button>
          <span className="top-divider" /><button className="export-button" onClick={exportCanvas}><Download size={15} /> Exportar</button>
        </div>
      </header>
      <section className="stagebar" aria-label="Project stages">
        <div className="stage-heading"><span>ESTÚDIO</span><span className="stage-slash">/</span><span>01</span></div>
        <div className="stage-track"><span className="stage-step active"><span className="stage-number">01</span> Desenhar</span><span className="stage-connector" /><span className="stage-step"><span className="stage-number">02</span> Rasterizar</span><span className="stage-connector" /><span className="stage-step"><span className="stage-number">03</span> Processar</span></div>
        <div className="stage-resolution"><Grid2X2 size={14} /> 32 × 20 px</div>
      </section>
      <div className="workspace-grid" id="workspace">
        <aside className="tool-panel">
          <div className="panel-kicker">FERRAMENTAS <span>07</span></div>
          <div className="tool-grid">{toolOptions.map(([id, label, Icon]) => <button key={id} className={`tool-button ${tool === id ? "selected" : ""}`} title={label} aria-label={label} aria-pressed={tool === id} onClick={() => setTool(id)}><Icon size={18} strokeWidth={1.8} /></button>)}</div>
          <div className="panel-rule" /><div className="panel-kicker">COR <span>{color.toUpperCase()}</span></div>
          <div className="swatch-row" aria-label="Ink color">{PALETTE.map((swatch) => <button key={swatch} className={`color-swatch ${color === swatch ? "chosen" : ""}`} style={{ backgroundColor: swatch }} title={`Choose ${swatch}`} aria-label={`Choose color ${swatch}`} aria-pressed={color === swatch} onClick={() => setColor(swatch)} />)}</div>
          <div className="panel-rule" /><div className="range-heading"><span>Espessura</span><output>{width}px</output></div>
          <input className="thickness-slider" type="range" min="2" max="18" value={width} onChange={(event) => setWidth(Number(event.target.value))} aria-label="Espessura do traço" />
          {tool === "polygon" && <button className="finish-polygon" disabled={vertices.length < 3} onClick={closePolygon}><Triangle size={14} /> Fechar polígono <span>{vertices.length}</span></button>}
          <div className="tool-tip"><span className="tip-dot" />{tool === "polygon" ? "Marque os cantos e feche a forma" : tool === "select" ? "Escolha uma ferramenta de desenho" : "Arraste no quadro para desenhar"}</div>
        </aside>
        <section className="canvas-panel" aria-label="Drawing workspace">
          <div className="canvas-toolbar">
            <div className="view-switch" role="tablist" aria-label="Visualização do desenho">{(["draw", "pixels", "3d"] as View[]).map((mode) => <button key={mode} role="tab" aria-selected={view === mode} className={view === mode ? "active" : ""} onClick={() => setView(mode)}>{mode === "draw" ? <Pencil size={14} /> : mode === "pixels" ? <Grid2X2 size={14} /> : <span className="cube-glyph">◇</span>}{mode === "3d" ? "Profundidade" : mode === "pixels" ? "Pixels" : "Desenho"}</button>)}</div>
            <div className="canvas-meta"><span className="live-dot" /> {view === "draw" ? "RASCUNHO VETORIAL" : view === "pixels" ? "PRÉVIA RASTERIZADA" : "PROFUNDIDADE DOS PIXELS"}</div>
          </div>
          <div className={`artboard ${view !== "draw" ? "artboard-output" : ""}`}>
            {view === "draw" && <canvas ref={canvasRef} className="drawing-canvas" width={W} height={H} aria-label="Quadro de desenho" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} />}
            {view === "pixels" && <div className="pixel-view" style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }} aria-label="Grade de pixels rasterizados">{output.flatMap((row, y) => row.map((pixel, x) => <span key={`${y}-${x}`} className="pixel-cell" style={{ backgroundColor: pixel ?? PAPER }} />))}</div>}
            {view === "3d" && <PixelScene pixels={output} />}
            <div className="canvas-caption"><span>FIG. 01</span><span>{view === "draw" ? "CASA / ESTUDO DE CONSTRUÇÃO" : `${filterOptions.find((item) => item.id === filter)?.name.toUpperCase()} / ${activePixels} PIXELS ATIVOS`}</span></div>
          </div>
          <div className="canvas-footer"><span>{shapes.length} formas</span><span>Área de desenho: 960 × 600</span></div>
        </section>
        <aside className="inspector-panel">
          <div className="inspector-title"><div><span className="panel-kicker">RESULTADO</span><h2>Relatório de pixels</h2></div><span className="report-badge">LOCAL</span></div>
          <div className="report-stat"><span>Resolução raster</span><strong>{COLUMNS} <small>×</small> {ROWS}</strong></div>
          <div className="report-stat"><span>Pixels ativos</span><strong>{activePixels.toString().padStart(3, "0")}</strong></div>
          <div className="report-stat"><span>Formas</span><strong>{shapes.length.toString().padStart(2, "0")}</strong></div>
          <div className="panel-rule" /><div className="panel-kicker">PROCESSAMENTO DE IMAGEM <span>01—04</span></div>
          <div className="filter-list">{filterOptions.map((item, index) => <button key={item.id} className={`filter-step ${filter === item.id ? "active" : ""}`} onClick={() => setFilter(item.id)} aria-pressed={filter === item.id}><span className="filter-index">0{index + 1}</span><span className="filter-name">{item.name}</span><span className="filter-mark" /></button>)}</div>
          <div className="matrix-preview"><div className="matrix-heading"><span>AMOSTRA DE PIXELS</span><span>32 × 20</span></div><div className="matrix-rows" aria-label="Amostra da matriz de pixels">{output.slice(3, 8).map((row, y) => <div key={y}>{row.slice(7, 25).map((pixel, x) => <i key={x} style={{ backgroundColor: pixel ?? "transparent" }} />)}</div>)}</div></div>
          <div className="backend-note"><span className="backend-indicator" /> Processamento em Python <span className="backend-state">não conectado</span></div>
        </aside>
      </div>
      <footer className="statusbar"><span><span className="status-square" /> TRAÇO & PIXEL <span className="status-separator">/</span> LABORATÓRIO DE COMPUTAÇÃO VISUAL</span><span>VERSÃO 001 <span className="status-separator">·</span> PROTÓTIPO DE INTERFACE</span></footer>
    </main>
  );
}
