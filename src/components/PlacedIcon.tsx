import { useDraggable } from '@dnd-kit/core'
import { X } from 'lucide-react'
import type { Player } from '../types'
import { useAppStore } from '../store/useAppStore'
import { IconGlyph } from './IconPicker'

type Props = {
  player: Player
  x: number
  y: number
  scale: number
}

export function PlacedIcon({ player, x, y, scale }: Props) {
  const removePlacement = useAppStore((s) => s.removePlacement)

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `placed-${player.id}`,
      data: { kind: 'placed', playerId: player.id },
    })

  // dnd-kit transform is in screen-space px; the map is transformed, so divide by scale.
  const dragOffset = transform
    ? { x: transform.x / scale, y: transform.y / scale }
    : { x: 0, y: 0 }

  return (
    <div
      ref={setNodeRef}
      className="dnd-handle absolute flex flex-col items-center select-none"
      style={{
        left: x + dragOffset.x,
        top: y + dragOffset.y,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 20 : 10,
        opacity: isDragging ? 0.7 : 1,
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
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white grid place-items-center shadow"
          title="Remove from map"
        >
          <X size={12} />
        </button>
      </div>
      <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-slate-100 text-xs border border-slate-700 whitespace-nowrap max-w-[160px] truncate">
        {player.name}
      </div>
    </div>
  )
}
