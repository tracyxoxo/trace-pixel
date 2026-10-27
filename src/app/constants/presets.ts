import { Preset } from "../types";

export const PALETTE = ["#183b3a", "#e86146", "#e5ae3d", "#438c7e"] as const;

export const PRESETS: Preset[] = [
  {
    id: "house",
    name: "Estudo da Casa",
    description: "Composição arquitetônica clássica com paredes, telhado, janelas e sol.",
    badge: "Clássico",
    shapes: [
      { id: 1, type: "rect", points: [{ x: 280, y: 260 }, { x: 680, y: 530 }], color: PALETTE[0], width: 6 },
      { id: 2, type: "polygon", points: [{ x: 245, y: 270 }, { x: 480, y: 82 }, { x: 715, y: 270 }], color: PALETTE[1], width: 7 },
      { id: 3, type: "rect", points: [{ x: 425, y: 375 }, { x: 535, y: 530 }], color: PALETTE[3], width: 6 },
      { id: 4, type: "rect", points: [{ x: 320, y: 325 }, { x: 390, y: 395 }], color: PALETTE[2], width: 6 },
      { id: 5, type: "rect", points: [{ x: 570, y: 325 }, { x: 640, y: 395 }], color: PALETTE[2], width: 6 },
      { id: 6, type: "circle", points: [{ x: 760, y: 150 }, { x: 800, y: 150 }], color: PALETTE[2], width: 6 },
    ],
  },
  {
    id: "heart",
    name: "Coração Geométrico",
    description: "Design orgânico e simétrico ideal para testar filtros e extrusão 3D.",
    badge: "Popular",
    shapes: [
      // Left lobe
      { id: 101, type: "circle", points: [{ x: 390, y: 240 }, { x: 490, y: 240 }], color: PALETTE[1], width: 8 },
      // Right lobe
      { id: 102, type: "circle", points: [{ x: 570, y: 240 }, { x: 670, y: 240 }], color: PALETTE[1], width: 8 },
      // Lower polygon heart contour
      {
        id: 103,
        type: "polygon",
        points: [
          { x: 300, y: 270 },
          { x: 480, y: 530 },
          { x: 660, y: 270 },
          { x: 480, y: 300 },
        ],
        color: PALETTE[1],
        width: 8,
      },
      // Inner sparkle/core
      { id: 104, type: "rect", points: [{ x: 440, y: 240 }, { x: 520, y: 320 }], color: PALETTE[2], width: 6 },
    ],
  },
  {
    id: "rocket",
    name: "Foguete em Decolagem",
    description: "Ilustração dinâmica com linhas vetoriais inclinadas e propulsão.",
    badge: "Espacial",
    shapes: [
      // Rocket main body (polygon tip)
      {
        id: 201,
        type: "polygon",
        points: [
          { x: 480, y: 110 },
          { x: 560, y: 230 },
          { x: 560, y: 410 },
          { x: 400, y: 410 },
          { x: 400, y: 230 },
        ],
        color: PALETTE[0],
        width: 7,
      },
      // Cockpit window
      { id: 202, type: "circle", points: [{ x: 480, y: 260 }, { x: 520, y: 260 }], color: PALETTE[3], width: 6 },
      // Left fin
      {
        id: 203,
        type: "polygon",
        points: [{ x: 400, y: 330 }, { x: 320, y: 440 }, { x: 400, y: 420 }],
        color: PALETTE[1],
        width: 6,
      },
      // Right fin
      {
        id: 204,
        type: "polygon",
        points: [{ x: 560, y: 330 }, { x: 640, y: 440 }, { x: 560, y: 420 }],
        color: PALETTE[1],
        width: 6,
      },
      // Exhaust fire
      {
        id: 205,
        type: "polygon",
        points: [{ x: 430, y: 425 }, { x: 480, y: 525 }, { x: 530, y: 425 }],
        color: PALETTE[2],
        width: 6,
      },
    ],
  },
  {
    id: "smiley",
    name: "Emoticon Sorridente",
    description: "Uma face simples para entender a rasterização de curvas e simetria.",
    badge: "Amigável",
    shapes: [
      // Head
      { id: 301, type: "circle", points: [{ x: 480, y: 300 }, { x: 680, y: 300 }], color: PALETTE[2], width: 8 },
      // Left eye
      { id: 302, type: "rect", points: [{ x: 380, y: 210 }, { x: 420, y: 270 }], color: PALETTE[0], width: 7 },
      // Right eye
      { id: 303, type: "rect", points: [{ x: 540, y: 210 }, { x: 580, y: 270 }], color: PALETTE[0], width: 7 },
      // Smile curve
      {
        id: 304,
        type: "path",
        points: [
          { x: 380, y: 340 },
          { x: 410, y: 380 },
          { x: 480, y: 410 },
          { x: 550, y: 380 },
          { x: 580, y: 340 },
        ],
        color: PALETTE[1],
        width: 8,
      },
    ],
  },
  {
    id: "typography",
    name: "Tipografia: Glifo 'A'",
    description: "Demonstra o problema clássico de renderização de fontes vetoriais em telas.",
    badge: "Design",
    shapes: [
      // Left diagonal stroke
      { id: 401, type: "line", points: [{ x: 480, y: 130 }, { x: 320, y: 490 }], color: PALETTE[0], width: 14 },
      // Right diagonal stroke
      { id: 402, type: "line", points: [{ x: 480, y: 130 }, { x: 640, y: 490 }], color: PALETTE[0], width: 14 },
      // Crossbar
      { id: 403, type: "line", points: [{ x: 380, y: 350 }, { x: 580, y: 350 }], color: PALETTE[1], width: 12 },
      // Baseline accent dots
      { id: 404, type: "circle", points: [{ x: 320, y: 490 }, { x: 335, y: 490 }], color: PALETTE[2], width: 6 },
      { id: 405, type: "circle", points: [{ x: 640, y: 490 }, { x: 655, y: 490 }], color: PALETTE[2], width: 6 },
    ],
  },
];
