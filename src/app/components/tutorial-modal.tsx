"use client";

import { useEffect, useState } from "react";
import { 
  Box, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  Eye, 
  Grid2X2, 
  Layers, 
  Lightbulb, 
  Pencil, 
  Sliders, 
  Sparkles, 
  X 
} from "lucide-react";
import { PRESETS } from "../constants/presets";
import { Preset } from "../types";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset?: (preset: Preset) => void;
  onSwitchView?: (view: "draw" | "pixels" | "3d") => void;
}

interface Step {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Lightbulb;
  visualType: "concept" | "tools" | "raster" | "filters" | "voxel";
  keyTakeaway: string;
  actionText?: string;
  actionView?: "draw" | "pixels" | "3d";
}

const STEPS: Step[] = [
  {
    id: "concept",
    badge: "01 · O Conceito",
    title: "Do Traço ao Pixel",
    subtitle: "A ponte visual entre matemática contínua e matrizes discretas.",
    description:
      "Tudo o que vemos em telas começa com geometrias contínuas (retas, arcos, polígonos). No entanto, monitores só conseguem exibir grades fixas de pixels. O Traço & Pixel foi criado para você ver e experimentar essa transformação acontecendo em tempo real.",
    icon: Sparkles,
    visualType: "concept",
    keyTakeaway: "Desenhe como vetor ➔ O sistema calcula a matriz ➔ Veja em pixels ou em blocos 3D.",
  },
  {
    id: "drawing",
    badge: "02 · Criatividade",
    title: "Estúdio de Desenho",
    subtitle: "Ferramentas simples para expressar formas geométricas.",
    description:
      "Na barra lateral esquerda, selecione entre Lápis (livre), Linha, Retângulo, Círculo, Polígono e Borracha. Ajuste a espessura do traço e experimente as cores da paleta inspirada em arte gráfica editorial.",
    icon: Pencil,
    visualType: "tools",
    keyTakeaway: "Dica: Com o polígono, marque vários pontos no quadro e clique em 'Fechar polígono'.",
    actionText: "Ver prancheta de desenho",
    actionView: "draw",
  },
  {
    id: "raster",
    badge: "03 · Computação Gráfica",
    title: "A Rasterização (32 × 20)",
    subtitle: "Como o computador transforma desenho contínuo em dados.",
    description:
      "O quadro de desenho (960×600) é dividido numa malha de 32 colunas por 20 linhas. Para cada célula, o estúdio calcula a média ponderada de cor dos pixels desenhados. Na aba 'Pixels', você enxerga a essência discreta da imagem.",
    icon: Grid2X2,
    visualType: "raster",
    keyTakeaway: "Alterne a visualização no topo do quadro entre 'Desenho' e 'Pixels'.",
    actionText: "Alternar para visão de Pixels",
    actionView: "pixels",
  },
  {
    id: "filters",
    badge: "04 · Visão Computacional",
    title: "Filtros e Processamento",
    subtitle: "Operações matemáticas aplicadas célula por célula.",
    description:
      "No painel direito, teste algoritmos fundamentais da área de visão computacional: Escala de Cinza (cálculo de luminância humana), Desfoque (convolução com células vizinhas) e Detecção de Bordas (identificação de transições bruscas de contraste).",
    icon: Sliders,
    visualType: "filters",
    keyTakeaway: "Cada filtro processa a matriz de dados diretamente no seu navegador.",
  },
  {
    id: "voxel",
    badge: "05 · Profundidade",
    title: "Exploração 3D & Voxel",
    subtitle: "Os pixels ganham volume físico com WebGL e Three.js.",
    description:
      "Na aba 'Profundidade', cada pixel ativo é extrudado como um pequeno cubo tridimensional iluminado com sombras em tempo real. Você pode clicar e arrastar com o mouse para girar o cenário em qualquer ângulo!",
    icon: Box,
    visualType: "voxel",
    keyTakeaway: "Arraste com o botão esquerdo para orbitar a cena 3D e use a roda do mouse para zoom.",
    actionText: "Explorar visão 3D",
    actionView: "3d",
  },
];

export default function TutorialModal({
  isOpen,
  onClose,
  onSelectPreset,
  onSwitchView,
}: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;
      if (event.key === "Escape") {
        handleClose();
      } else if (event.key === "ArrowRight") {
        setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1));
      } else if (event.key === "ArrowLeft") {
        setCurrentStep((prev) => Math.max(0, prev - 1));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function handleClose() {
    if (dontShowAgain && typeof window !== "undefined") {
      try {
        localStorage.setItem("traco_pixel_tutorial_seen", "true");
      } catch {
        // ignore storage errors
      }
    }
    onClose();
  }

  function handleAction(step: Step) {
    if (step.actionView && onSwitchView) {
      onSwitchView(step.actionView);
    }
    handleClose();
  }

  function handleLoadSamplePreset(preset: Preset) {
    if (onSelectPreset) {
      onSelectPreset(preset);
    }
    handleClose();
  }

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const StepIcon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
      <div className="tutorial-card">
        {/* Top Header */}
        <header className="tutorial-header">
          <div className="tutorial-header-info">
            <span className="tutorial-badge">
              <StepIcon size={14} className="tutorial-badge-icon" />
              {step.badge}
            </span>
            <span className="tutorial-step-counter">
              Passo {currentStep + 1} de {STEPS.length}
            </span>
          </div>

          <button
            className="tutorial-close-btn"
            onClick={handleClose}
            aria-label="Fechar tutorial (Esc)"
            title="Fechar (Esc)"
          >
            <X size={17} />
          </button>
        </header>

        {/* Progress Bar Indicator */}
        <div className="tutorial-progress-bar" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
          {STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(idx)}
              className={`tutorial-progress-segment ${idx === currentStep ? "active" : ""} ${idx < currentStep ? "completed" : ""}`}
              aria-label={`Ir para passo ${idx + 1}: ${s.title}`}
              title={s.title}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="tutorial-body">
          {/* Visual Showcase Graphic */}
          <div className="tutorial-visual-showcase">
            {step.visualType === "concept" && (
              <div className="visual-diagram-concept">
                <div className="concept-node vector-node">
                  <span className="node-tag">01 · VETOR</span>
                  <div className="vector-preview">
                    <svg viewBox="0 0 100 60" className="preview-svg">
                      <polygon points="50,10 85,50 15,50" fill="none" stroke="#e86146" strokeWidth="4" />
                      <circle cx="50" cy="10" r="3" fill="#193b39" />
                      <circle cx="85" cy="50" r="3" fill="#193b39" />
                      <circle cx="15" cy="50" r="3" fill="#193b39" />
                    </svg>
                  </div>
                  <span className="node-caption">Linhas Contínuas</span>
                </div>

                <div className="concept-arrow">➔</div>

                <div className="concept-node raster-node">
                  <span className="node-tag">02 · MATRIZ</span>
                  <div className="raster-preview-grid">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const isActive = [3, 4, 8, 9, 10, 11, 13, 16, 19, 20, 21].includes(i);
                      return (
                        <span
                          key={i}
                          className="preview-mini-cell"
                          style={{
                            backgroundColor: isActive ? "#e86146" : "#edf2ec",
                            opacity: isActive ? 1 : 0.4,
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="node-caption">Grade 32×20</span>
                </div>

                <div className="concept-arrow">➔</div>

                <div className="concept-node voxel-node">
                  <span className="node-tag">03 · 3D VOXEL</span>
                  <div className="voxel-preview-cube">
                    <div className="cube-render">
                      <Box size={38} strokeWidth={1.4} color="#193b39" />
                    </div>
                  </div>
                  <span className="node-caption">Extrusão no Espaço</span>
                </div>
              </div>
            )}

            {step.visualType === "tools" && (
              <div className="visual-diagram-tools">
                <div className="tools-card-showcase">
                  <div className="tool-chip-group">
                    <span className="tool-chip active">✏️ Lápis Livre</span>
                    <span className="tool-chip">📐 Retângulo & Círculo</span>
                    <span className="tool-chip">🔺 Polígono Multipontos</span>
                    <span className="tool-chip">🧹 Borracha Precisa</span>
                  </div>
                  <div className="tools-palette-showcase">
                    <span className="palette-label">Paleta de Tinta Curada:</span>
                    <div className="palette-dots">
                      <span style={{ backgroundColor: "#183b3a" }} title="Verde Tinta Profundo" />
                      <span style={{ backgroundColor: "#e86146" }} title="Terracota Vibrante" />
                      <span style={{ backgroundColor: "#e5ae3d" }} title="Amarelo Ocre" />
                      <span style={{ backgroundColor: "#438c7e" }} title="Sálvia Mineral" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step.visualType === "raster" && (
              <div className="visual-diagram-raster">
                <div className="raster-comparison">
                  <div className="raster-side">
                    <span className="side-title">Vetor Suave</span>
                    <div className="side-box vector-box">
                      <div className="smooth-circle" />
                    </div>
                    <small>Fórmula: (x-a)² + (y-b)² = r²</small>
                  </div>
                  <div className="raster-divider">VS</div>
                  <div className="raster-side">
                    <span className="side-title">Amostragem em Pixels</span>
                    <div className="side-box pixel-box">
                      <div className="stepped-circle">
                        {Array.from({ length: 36 }).map((_, i) => {
                          const active = [7, 8, 10, 11, 14, 15, 16, 17, 20, 21, 22, 23, 26, 27, 28, 29].includes(i);
                          return (
                            <i
                              key={i}
                              style={{
                                backgroundColor: active ? "#183b3a" : "transparent",
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <small>Matriz discreta de cor</small>
                  </div>
                </div>
              </div>
            )}

            {step.visualType === "filters" && (
              <div className="visual-diagram-filters">
                <div className="filters-carousel-row">
                  <div className="filter-pill-card">
                    <div className="filter-sample original-sample">
                      <span>🎨</span>
                    </div>
                    <strong>Original</strong>
                    <small>Cores puras da paleta</small>
                  </div>
                  <div className="filter-pill-card">
                    <div className="filter-sample gray-sample">
                      <span>◑</span>
                    </div>
                    <strong>Escala de Cinza</strong>
                    <small>Luminância ponderada</small>
                  </div>
                  <div className="filter-pill-card">
                    <div className="filter-sample blur-sample">
                      <span>💧</span>
                    </div>
                    <strong>Desfoque</strong>
                    <small>Média da vizinhança 3×3</small>
                  </div>
                  <div className="filter-pill-card">
                    <div className="filter-sample edge-sample">
                      <span>⚡</span>
                    </div>
                    <strong>Detecção Bordas</strong>
                    <small>Gradientes de contraste</small>
                  </div>
                </div>
              </div>
            )}

            {step.visualType === "voxel" && (
              <div className="visual-diagram-voxel">
                <div className="voxel-card-content">
                  <div className="voxel-cube-scene">
                    <div className="voxel-grid-preview">
                      <div className="voxel-pillar h1" />
                      <div className="voxel-pillar h3" />
                      <div className="voxel-pillar h2" />
                      <div className="voxel-pillar h4" />
                      <div className="voxel-pillar h2" />
                    </div>
                  </div>
                  <div className="voxel-hints">
                    <p>💡 <strong>Interatividade Completa:</strong></p>
                    <ul>
                      <li>Clique e arraste com o <strong>botão esquerdo</strong> para orbitar</li>
                      <li>Use a <strong>roda do mouse</strong> para aproximar e afastar</li>
                      <li>Iluminação dinâmica com sombras projetadas</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Text Description */}
          <div className="tutorial-text-block">
            <h2 id="tutorial-title" className="tutorial-heading">
              {step.title}
            </h2>
            <p className="tutorial-subtitle">{step.subtitle}</p>
            <p className="tutorial-description">{step.description}</p>

            <div className="tutorial-key-takeaway">
              <Lightbulb size={16} className="takeaway-icon" />
              <span>{step.keyTakeaway}</span>
            </div>
          </div>

          {/* Quick Presets Section on the final step */}
          {isLast && (
            <div className="tutorial-presets-tray">
              <div className="presets-tray-header">
                <span className="tray-title">
                  <Sparkles size={14} /> Comece rápido com um modelo pronto:
                </span>
              </div>
              <div className="presets-tray-buttons">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    className="preset-quick-button"
                    onClick={() => handleLoadSamplePreset(p)}
                  >
                    <span className="preset-quick-name">{p.name}</span>
                    <span className="preset-quick-badge">{p.badge}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <footer className="tutorial-footer">
          <div className="tutorial-footer-left">
            <label className="dont-show-again-label">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <span>Não mostrar automaticamente ao abrir</span>
            </label>
          </div>

          <div className="tutorial-footer-right">
            {!isFirst && (
              <button
                className="tutorial-btn tutorial-btn-secondary"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
            )}

            {step.actionText && (
              <button
                className="tutorial-btn tutorial-btn-ghost"
                onClick={() => handleAction(step)}
              >
                <Eye size={14} /> {step.actionText}
              </button>
            )}

            {!isLast ? (
              <button
                className="tutorial-btn tutorial-btn-primary"
                onClick={() => setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
              >
                Próximo <ChevronRight size={16} />
              </button>
            ) : (
              <button
                className="tutorial-btn tutorial-btn-primary tutorial-btn-finish"
                onClick={handleClose}
              >
                <Check size={16} /> Começar a Criar!
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
