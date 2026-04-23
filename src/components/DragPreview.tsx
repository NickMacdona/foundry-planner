import { ArrowRight, Circle, Square, Type } from 'lucide-react'
import type { AnnotationType } from '../types'
import { DEFAULT_ANNOTATION_COLOR } from '../types'
import { useAppStore } from '../store/useAppStore'
import { IconGlyph } from './IconPicker'

export type ActiveDrag =
  | { kind: 'roster'; playerId: string }
  | { kind: 'placed'; playerId: string }
  | { kind: 'new-annotation'; annotationType: AnnotationType }

export function DragPreview({ active }: { active: ActiveDrag }) {
  const player = useAppStore((s) =>
    active.kind === 'roster' || active.kind === 'placed'
      ? s.players.find((p) => p.id === active.playerId) ?? null
      : null,
  )
  const currentColor = useAppStore((s) => s.currentColor)

  if ((active.kind === 'roster' || active.kind === 'placed') && player) {
    return (
      <div className="flex flex-col items-center pointer-events-none">
        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white grid place-items-center shadow-xl ring-2 ring-indigo-300/60">
          <IconGlyph type={player.icon} size={22} />
        </div>
        <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-slate-100 text-xs border border-slate-700 whitespace-nowrap max-w-[160px] truncate">
          {player.name}
        </div>
      </div>
    )
  }

  if (active.kind === 'new-annotation') {
    const color = currentColor || DEFAULT_ANNOTATION_COLOR
    return (
      <div
        className="px-3 py-2 rounded border bg-slate-900/85 text-slate-100 text-sm flex items-center gap-2 shadow-xl pointer-events-none"
        style={{ borderColor: color, color }}
      >
        <AnnotationGlyph type={active.annotationType} />
        <span className="capitalize">{active.annotationType}</span>
      </div>
    )
  }

  return null
}

function AnnotationGlyph({ type }: { type: AnnotationType }) {
  switch (type) {
    case 'arrow':
      return <ArrowRight size={18} />
    case 'box':
      return <Square size={18} />
    case 'circle':
      return <Circle size={18} />
    case 'text':
      return <Type size={18} />
  }
}
