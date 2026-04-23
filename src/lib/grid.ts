import { GRID_SIZE, MAP_HEIGHT, MAP_WIDTH } from '../types'

export function snap(v: number, size = GRID_SIZE): number {
  return Math.round(v / size) * size
}

export function clampToMap(x: number, y: number) {
  return {
    x: Math.max(0, Math.min(MAP_WIDTH, x)),
    y: Math.max(0, Math.min(MAP_HEIGHT, y)),
  }
}

export type TransformState = {
  positionX: number
  positionY: number
  scale: number
}

/**
 * Convert a screen-space pointer position into the map's virtual coordinate
 * space, accounting for the current pan/zoom transform on the map container.
 */
export function screenToMap(
  screen: { x: number; y: number },
  mapRect: { left: number; top: number },
  transform: TransformState,
) {
  return {
    x: (screen.x - mapRect.left - transform.positionX) / transform.scale,
    y: (screen.y - mapRect.top - transform.positionY) / transform.scale,
  }
}
