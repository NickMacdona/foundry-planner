import { useDraggable } from '@dnd-kit/core'
import { GripVertical, MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Player } from '../types'
import { useAppStore } from '../store/useAppStore'
import { IconPicker } from './IconPicker'

type Props = {
  player: Player
  placedOnMap: boolean
}

export function RosterItem({ player, placedOnMap }: Props) {
  const renamePlayer = useAppStore((s) => s.renamePlayer)
  const setIcon = useAppStore((s) => s.setIcon)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(player.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `roster-${player.id}`,
    data: { kind: 'roster', playerId: player.id },
  })

  const commitName = () => {
    const next = draft.trim() || player.name
    if (next !== player.name) renamePlayer(player.id, next)
    setEditing(false)
  }

  // While editing, suppress drag listeners so text selection / caret work.
  const dragProps = editing ? {} : { ...listeners, ...attributes }

  return (
    <div
      ref={setNodeRef}
      {...dragProps}
      className={
        'flex items-center gap-2 px-2 py-1.5 rounded border select-none ' +
        (placedOnMap
          ? 'border-indigo-500/60 bg-slate-800/60'
          : 'border-slate-700 bg-slate-800/30') +
        (editing ? ' cursor-text' : ' cursor-grab active:cursor-grabbing') +
        (isDragging ? ' opacity-40' : '')
      }
      title={editing ? undefined : 'Drag to map'}
    >
      <span className="text-slate-500 shrink-0">
        <GripVertical size={16} />
      </span>

      <div onPointerDown={(e) => e.stopPropagation()}>
        <IconPicker
          value={player.icon}
          onChange={(next) => setIcon(player.id, next)}
        />
      </div>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitName}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitName()
            if (e.key === 'Escape') {
              setDraft(player.name)
              setEditing(false)
            }
          }}
          className="flex-1 min-w-0 bg-slate-900 border border-slate-600 rounded px-2 py-0.5 text-sm text-slate-100"
          maxLength={40}
        />
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDraft(player.name)
            setEditing(true)
          }}
          className="flex-1 min-w-0 text-left text-sm text-slate-100 truncate hover:text-indigo-300"
          title="Click to rename"
        >
          {player.name}
        </button>
      )}

      {placedOnMap && (
        <span title="Placed on map" className="text-indigo-400 shrink-0">
          <MapPin size={14} />
        </span>
      )}
    </div>
  )
}
