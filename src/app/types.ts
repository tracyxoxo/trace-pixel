export type Tool = "select" | "pen" | "line" | "rect" | "circle" | "polygon" | "eraser";
export type View = "draw" | "pixels" | "3d";
export type Filter = "original" | "grayscale" | "blur" | "edges";

export type Point = {
  x: number;
  y: number;
};

export type Shape = {
  id: number;
  type: "path" | "line" | "rect" | "circle" | "polygon";
  points: Point[];
  color: string;
  width: number;
};

export type Matrix = (string | null)[][];

export type Preset = {
  id: string;
  name: string;
  description: string;
  badge?: string;
  shapes: Shape[];
};
