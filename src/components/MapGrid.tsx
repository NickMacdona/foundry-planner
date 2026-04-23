import type { ReactElement } from 'react'
import { GRID_SIZE, MAP_HEIGHT, MAP_WIDTH } from '../types'

export function MapGrid() {
  const cols = Math.floor(MAP_WIDTH / GRID_SIZE)
  const rows = Math.floor(MAP_HEIGHT / GRID_SIZE)
  const lines: ReactElement[] = []
  for (let i = 0; i <= cols; i++) {
    const x = i * GRID_SIZE
    lines.push(
      <line
        key={`v${i}`}
        x1={x}
        y1={0}
        x2={x}
        y2={MAP_HEIGHT}
        stroke="#334155"
        strokeWidth={i % 5 === 0 ? 1 : 0.5}
      />,
    )
  }
  for (let i = 0; i <= rows; i++) {
    const y = i * GRID_SIZE
    lines.push(
      <line
        key={`h${i}`}
        x1={0}
        y1={y}
        x2={MAP_WIDTH}
        y2={y}
        stroke="#334155"
        strokeWidth={i % 5 === 0 ? 1 : 0.5}
      />,
    )
  }
  return (
    <svg
      width={MAP_WIDTH}
      height={MAP_HEIGHT}
      className="absolute inset-0 pointer-events-none"
    >
      <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#1e293b" />
      {lines}
    </svg>
  )
}
