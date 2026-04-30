import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEFAULT_ANNOTATION_COLOR,
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

function seedJoinPlayers(): Player[] {
  return Array.from({ length: ROSTER_SIZE }, (_, i) => ({
    id: `p-${String(i + 1).padStart(2, '0')}`,
    name: `Player ${i + 1}`,
    icon: 'shield' as IconType,
    mode: 'join' as RosterMode,
  }))
}

function seedSubPlayers(): Player[] {
  return Array.from({ length: SUB_CAP }, (_, i) => ({
    id: `s-${String(i + 1).padStart(2, '0')}`,
    name: `Sub ${i + 1}`,
    icon: 'shield' as IconType,
    mode: 'sub' as RosterMode,
  }))
}

function seedAllPlayers(): Player[] {
  return [...seedJoinPlayers(), ...seedSubPlayers()]
}

type Actions = {
  renamePlayer: (id: string, name: string) => void
  setIcon: (id: string, icon: IconType) => void
  setActiveTab: (tab: RosterMode) => void
  setCurrentColor: (color: string) => void

  placePlayer: (playerId: string, x: number, y: number) => void
  movePlacement: (playerId: string, x: number, y: number) => void
  removePlacement: (playerId: string) => void

  addAnnotation: (type: AnnotationType, x: number, y: number) => string
  updateAnnotation: (id: string, patch: Partial<Annotation>) => void
  removeAnnotation: (id: string) => void

  importPlayerNames: (mode: RosterMode, names: string[]) => void
  replaceState: (s: AppState) => void
  reset: () => void
}

const initialState: AppState = {
  players: seedAllPlayers(),
  placements: [],
  annotations: [],
  activeTab: 'join',
  currentColor: DEFAULT_ANNOTATION_COLOR,
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

      setActiveTab: (tab) => set({ activeTab: tab }),

      setCurrentColor: (color) => set({ currentColor: color }),

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
        const ann: Annotation = {
          id,
          type,
          x,
          y,
          w: d.w,
          h: d.h,
          text: d.text,
          color: get().currentColor,
        }
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

      importPlayerNames: (mode, names) => {
        const slots = get().players.filter((p) => p.mode === mode)
        const updates = new Map<string, string>()
        for (let i = 0; i < Math.min(names.length, slots.length); i++) {
          updates.set(slots[i].id, names[i])
        }
        set({
          players: get().players.map((p) =>
            updates.has(p.id) ? { ...p, name: updates.get(p.id)! } : p,
          ),
        })
      },

      replaceState: (s) =>
        set({
          players: s.players,
          placements: s.placements,
          annotations: s.annotations,
          activeTab: s.activeTab,
          currentColor: s.currentColor ?? DEFAULT_ANNOTATION_COLOR,
        }),

      reset: () => set({ ...initialState, players: seedAllPlayers() }),
    }),
    {
      name: 'foundry-planner',
      version: 2,
      partialize: (s) => ({
        players: s.players,
        placements: s.placements,
        annotations: s.annotations,
        activeTab: s.activeTab,
        currentColor: s.currentColor,
      }),
      migrate: (persisted, fromVersion) => {
        // v1: only 30 join players; no dedicated sub placeholders.
        // v2: 30 join + 20 sub placeholders (distinct IDs, mode is now fixed per slot).
        const s = (persisted ?? {}) as Partial<AppState>
        const existing = Array.isArray(s.players) ? s.players : []
        if (fromVersion < 2) {
          // Keep any previously-saved players, but reset them to mode='join' so the
          // old swap-based mode assignments don't leak into the new fixed-slot model.
          // Then ensure 20 dedicated sub placeholders exist.
          const normalizedJoins = existing
            .filter((p) => p && typeof p.id === 'string')
            .map((p) => ({ ...p, mode: 'join' as RosterMode }))
          const joinIds = new Set(normalizedJoins.map((p) => p.id))
          const seededJoins = seedJoinPlayers().filter((p) => !joinIds.has(p.id))
          return {
            players: [...normalizedJoins, ...seededJoins, ...seedSubPlayers()],
            placements: Array.isArray(s.placements) ? s.placements : [],
            annotations: Array.isArray(s.annotations) ? s.annotations : [],
            activeTab: s.activeTab === 'sub' ? 'sub' : 'join',
            currentColor:
              typeof s.currentColor === 'string'
                ? s.currentColor
                : DEFAULT_ANNOTATION_COLOR,
          }
        }
        return persisted
      },
    },
  ),
)
