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
}

export type AppState = {
  players: Player[]
  placements: Placement[]
  annotations: Annotation[]
  activeTab: RosterMode
}

export const SUB_CAP = 20
export const ROSTER_SIZE = 30
export const GRID_SIZE = 40
export const MAP_WIDTH = 1600
export const MAP_HEIGHT = 1280
export const MAP_IMAGE_URL = '/foundry-map.webp'
