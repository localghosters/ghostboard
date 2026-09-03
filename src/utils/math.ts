import type { Viewport } from "../state/store";

export interface Point {
  x: number;
  y: number;
}

export function screenToBoard(screen: Point, viewport: Viewport): Point {
  return {
    x: viewport.x + screen.x / viewport.zoom,
    y: viewport.y + screen.y / viewport.zoom,
  };
}

export function boardToScreen(board: Point, viewport: Viewport): Point {
  return {
    x: (board.x - viewport.x) * viewport.zoom,
    y: (board.y - viewport.y) * viewport.zoom,
  };
}

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 8;

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function snap(value: number, grid = 1): number {
  if (grid <= 0) return value;
  return Math.round(value / grid) * grid;
}
