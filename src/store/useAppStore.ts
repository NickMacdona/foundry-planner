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
  type Phase,
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

function makePhase(name: string): Phase {
  return { id: makeId('ph'), name, placements: [], annotations: [] }
}

function defaultPhases(): Phase[] {
  return [{ id: 'ph-default', name: 'Phase 1', placements: [], annotations: [] }]
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

  addPhase: () => void
  removePhase: (id: string) => void
  renamePhase: (id: string, name: string) => void
  setActivePhase: (id: string) => void

  importPlayerNames: (mode: RosterMode, names: string[]) => void
  replaceState: (s: AppState) => void
  reset: () => void
}

function updateActivePhase(
  phases: Phase[],
  activePhaseId: string,
  updater: (phase: Phase) => Phase,
): Phase[] {
  return phases.map((p) => (p.id === activePhaseId ? updater(p) : p))
}

function getActivePhase(state: AppState): Phase {
  return state.phases.find((p) => p.id === state.activePhaseId) ?? state.phases[0]
}

const initialState: AppState = {
  players: seedAllPlayers(),
  phases: defaultPhases(),
  activePhaseId: 'ph-default',
  activeTab: 'join',
  currentColor: DEFAULT_ANNOTATION_COLOR,
}

export const selectPlacements = (s: AppState): Placement[] =>
  getActivePhase(s).placements

export const selectAnnotations = (s: AppState): Annotation[] =>
  getActivePhase(s).annotations

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
        const { phases, activePhaseId } = get()
        const phase = getActivePhase(get())
        const existing = phase.placements.find((p) => p.playerId === playerId)
        set({
          phases: updateActivePhase(phases, activePhaseId, (ph) => ({
            ...ph,
            placements: existing
              ? ph.placements.map((p) =>
                  p.playerId === playerId ? { ...p, x, y } : p,
                )
              : [...ph.placements, { playerId, x, y }],
          })),
        })
      },

      movePlacement: (playerId, x, y) => {
        const { phases, activePhaseId } = get()
        set({
          phases: updateActivePhase(phases, activePhaseId, (ph) => ({
            ...ph,
            placements: ph.placements.map((p) =>
              p.playerId === playerId ? { ...p, x, y } : p,
            ),
          })),
        })
      },

      removePlacement: (playerId) => {
        const { phases, activePhaseId } = get()
        set({
          phases: updateActivePhase(phases, activePhaseId, (ph) => ({
            ...ph,
            placements: ph.placements.filter(
              (p: Placement) => p.playerId !== playerId,
            ),
          })),
        })
      },

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
        const { phases, activePhaseId } = get()
        set({
          phases: updateActivePhase(phases, activePhaseId, (ph) => ({
            ...ph,
            annotations: [...ph.annotations, ann],
          })),
        })
        return id
      },

      updateAnnotation: (id, patch) => {
        const { phases, activePhaseId } = get()
        set({
          phases: updateActivePhase(phases, activePhaseId, (ph) => ({
            ...ph,
            annotations: ph.annotations.map((a) =>
              a.id === id ? { ...a, ...patch } : a,
            ),
          })),
        })
      },

      removeAnnotation: (id) => {
        const { phases, activePhaseId } = get()
        set({
          phases: updateActivePhase(phases, activePhaseId, (ph) => ({
            ...ph,
            annotations: ph.annotations.filter((a) => a.id !== id),
          })),
        })
      },

      addPhase: () => {
        const { phases } = get()
        const current = getActivePhase(get())
        const phase: Phase = {
          ...makePhase(`Phase ${phases.length + 1}`),
          placements: current.placements.map((p) => ({ ...p })),
        }
        set({ phases: [...phases, phase], activePhaseId: phase.id })
      },

      removePhase: (id) => {
        const { phases, activePhaseId } = get()
        if (phases.length <= 1) return
        const next = phases.filter((p) => p.id !== id)
        set({
          phases: next,
          activePhaseId: activePhaseId === id ? next[0].id : activePhaseId,
        })
      },

      renamePhase: (id, name) =>
        set({
          phases: get().phases.map((p) =>
            p.id === id ? { ...p, name } : p,
          ),
        }),

      setActivePhase: (id) => set({ activePhaseId: id }),

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
          phases: s.phases,
          activePhaseId: s.activePhaseId,
          activeTab: s.activeTab,
          currentColor: s.currentColor ?? DEFAULT_ANNOTATION_COLOR,
        }),

      reset: () => set({ ...initialState, players: seedAllPlayers(), phases: defaultPhases() }),
    }),
    {
      name: 'foundry-planner',
      version: 3,
      partialize: (s) => ({
        players: s.players,
        phases: s.phases,
        activePhaseId: s.activePhaseId,
        activeTab: s.activeTab,
        currentColor: s.currentColor,
      }),
      migrate: (persisted, fromVersion) => {
        const s = (persisted ?? {}) as Record<string, unknown>
        const existing = Array.isArray(s.players) ? (s.players as Player[]) : []

        if (fromVersion < 2) {
          const normalizedJoins = existing
            .filter((p) => p && typeof p.id === 'string')
            .map((p) => ({ ...p, mode: 'join' as RosterMode }))
          const joinIds = new Set(normalizedJoins.map((p) => p.id))
          const seededJoins = seedJoinPlayers().filter((p) => !joinIds.has(p.id))
          const players = [...normalizedJoins, ...seededJoins, ...seedSubPlayers()]
          const phase: Phase = {
            id: 'ph-default',
            name: 'Phase 1',
            placements: Array.isArray(s.placements) ? (s.placements as Placement[]) : [],
            annotations: Array.isArray(s.annotations) ? (s.annotations as Annotation[]) : [],
          }
          return {
            players,
            phases: [phase],
            activePhaseId: 'ph-default',
            activeTab: s.activeTab === 'sub' ? 'sub' : 'join',
            currentColor:
              typeof s.currentColor === 'string'
                ? s.currentColor
                : DEFAULT_ANNOTATION_COLOR,
          }
        }

        if (fromVersion < 3) {
          const phase: Phase = {
            id: 'ph-default',
            name: 'Phase 1',
            placements: Array.isArray(s.placements) ? (s.placements as Placement[]) : [],
            annotations: Array.isArray(s.annotations) ? (s.annotations as Annotation[]) : [],
          }
          return {
            players: existing,
            phases: [phase],
            activePhaseId: 'ph-default',
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
