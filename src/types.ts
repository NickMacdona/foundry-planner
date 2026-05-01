export type IconType = 'shield' | 'swords' | 'plus' | 'shovel'
export type RosterMode = 'join' | 'sub'

export type Player = {
  id: string
  name: string
  icon: IconType
  mode: RosterMode
}

export type Placement = {
  playerId: string
  x: number
  y: number
}

export type AnnotationType = 'arrow' | 'box' | 'circle' | 'text'

export type Annotation = {
  id: string
  type: AnnotationType
  x: number
  y: number
  w: number
  h: number
  text?: string
  color?: string
}

export const ANNOTATION_COLORS: string[] = [
  '#fbbf24', // amber
  '#ef4444', // red
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ec4899', // pink
  '#22d3ee', // cyan
  '#f1f5f9', // white
  '#000000', // black
]

export const DEFAULT_ANNOTATION_COLOR = ANNOTATION_COLORS[0]

export type Phase = {
  id: string
  name: string
  placements: Placement[]
  annotations: Annotation[]
}

export type AppState = {
  players: Player[]
  phases: Phase[]
  activePhaseId: string
  activeTab: RosterMode
  currentColor: string
}

export const SUB_CAP = 20
export const ROSTER_SIZE = 30
export const GRID_SIZE = 20
export const MAP_WIDTH = 1380
export const MAP_HEIGHT = 1380
export const MAP_IMAGE_URL = `${import.meta.env.BASE_URL}foundry-map.webp`
