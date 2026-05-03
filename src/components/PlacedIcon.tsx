import { useDraggable } from '@dnd-kit/core'
import { X } from 'lucide-react'
import { useState } from 'react'
import type { Player } from '../types'
import { useAppStore } from '../store/useAppStore'
import { IconGlyph } from './IconPicker'

type Props = {
  player: Player
  x: number
  y: number
}

export function PlacedIcon({ player, x, y }: Props) {
  const removePlacement = useAppStore((s) => s.removePlacement)
  const labelSize = useAppStore((s) => s.labelSize)
  const [tapped, setTapped] = useState(false)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `placed-${player.id}`,
    data: { kind: 'placed', playerId: player.id },
  })

  return (
    <div
      ref={setNodeRef}
      className="dnd-handle group absolute flex flex-col items-center select-none"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 20 : 10,
        opacity: isDragging ? 0.3 : 1,
      }}
      onClick={() => setTapped((v) => !v)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setTapped(false)
      }}
    >
      <div
        {...listeners}
        {...attributes}
        className="relative w-10 h-10 rounded-full bg-indigo-600 text-white grid place-items-center shadow-lg cursor-grab active:cursor-grabbing ring-2 ring-indigo-300/40"
      >
        <IconGlyph type={player.icon} size={22} />
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            removePlacement(player.id)
          }}
          className={
            'absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white grid place-items-center shadow transition-opacity ' +
            (tapped ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')
          }
          title="Remove from map"
        >
          <X size={12} />
        </button>
      </div>
      <div
        className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-slate-100 border border-slate-700 whitespace-nowrap max-w-[160px] truncate"
        style={{ fontSize: labelSize }}
      >
        {player.name}
      </div>
    </div>
  )
}
