import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  ROSTER_SIZE,
  SUB_CAP,
  type Annotation,
  type AnnotationType,
  type AppState,
  type IconType,
  type Placement,
  type Player,
  type RosterMode,
} from '../types'
import { makeId } from '../lib/ids'

function seedPlayers(): Player[] {
  return Array.from({ length: ROSTER_SIZE }, (_, i) => ({
    id: `p-${String(i + 1).padStart(2, '0')}`,
    name: `Player ${i + 1}`,
    icon: 'shield' as IconType,
    mode: 'join' as RosterMode,
  }))
}

type Actions = {
  renamePlayer: (id: string, name: string) => void
  setIcon: (id: string, icon: IconType) => void
  setMode: (id: string, mode: RosterMode) => boolean
  cycleMode: (id: string) => boolean
  setActiveTab: (tab: RosterMode) => void

  placePlayer: (playerId: string, x: number, y: number) => void
  movePlacement: (playerId: string, x: number, y: number) => void
  removePlacement: (playerId: string) => void

  addAnnotation: (type: AnnotationType, x: number, y: number) => string
  updateAnnotation: (id: string, patch: Partial<Annotation>) => void
  removeAnnotation: (id: string) => void

  replaceState: (s: AppState) => void
  reset: () => void
}

const initialState: AppState = {
  players: seedPlayers(),
  placements: [],
  annotations: [],
  activeTab: 'join',
}

export const useAppStore = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,

      renamePlayer: (id, name) =>
        set({
          players: get().players.map((p) =>
            p.id === id ? { ...p, name } : p,
          ),
        }),

      setIcon: (id, icon) =>
        set({
          players: get().players.map((p) =>
            p.id === id ? { ...p, icon } : p,
          ),
        }),

      setMode: (id, mode) => {
        const players = get().players
        const target = players.find((p) => p.id === id)
        if (!target || target.mode === mode) return true
        if (mode === 'sub') {
          const currentSubs = players.filter((p) => p.mode === 'sub').length
          if (currentSubs >= SUB_CAP) return false
        }
        set({
          players: players.map((p) => (p.id === id ? { ...p, mode } : p)),
        })
        return true
      },

      cycleMode: (id) => {
        const target = get().players.find((p) => p.id === id)
        if (!target) return false
        return get().setMode(id, target.mode === 'join' ? 'sub' : 'join')
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      placePlayer: (playerId, x, y) => {
        const existing = get().placements.find((p) => p.playerId === playerId)
        if (existing) {
          set({
            placements: get().placements.map((p) =>
              p.playerId === playerId ? { ...p, x, y } : p,
            ),
          })
        } else {
          set({ placements: [...get().placements, { playerId, x, y }] })
        }
      },

      movePlacement: (playerId, x, y) =>
        set({
          placements: get().placements.map((p) =>
            p.playerId === playerId ? { ...p, x, y } : p,
          ),
        }),

      removePlacement: (playerId) =>
        set({
          placements: get().placements.filter(
            (p: Placement) => p.playerId !== playerId,
          ),
        }),

      addAnnotation: (type, x, y) => {
        const id = makeId('a')
        const defaults: Record<AnnotationType, { w: number; h: number; text?: string }> = {
          arrow: { w: 160, h: 0 },
          box: { w: 160, h: 100 },
          circle: { w: 140, h: 140 },
          text: { w: 180, h: 48, text: 'Text' },
        }
        const d = defaults[type]
        const ann: Annotation = { id, type, x, y, w: d.w, h: d.h, text: d.text }
        set({ annotations: [...get().annotations, ann] })
        return id
      },

      updateAnnotation: (id, patch) =>
        set({
          annotations: get().annotations.map((a) =>
            a.id === id ? { ...a, ...patch } : a,
          ),
        }),

      removeAnnotation: (id) =>
        set({ annotations: get().annotations.filter((a) => a.id !== id) }),

      replaceState: (s) =>
        set({
          players: s.players,
          placements: s.placements,
          annotations: s.annotations,
          activeTab: s.activeTab,
        }),

      reset: () => set({ ...initialState, players: seedPlayers() }),
    }),
    {
      name: 'foundry-planner',
      partialize: (s) => ({
        players: s.players,
        placements: s.placements,
        annotations: s.annotations,
        activeTab: s.activeTab,
      }),
    },
  ),
)
