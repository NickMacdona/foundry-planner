import { useDraggable } from '@dnd-kit/core'
import { ArrowLeftRight, GripVertical, MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Player } from '../types'
import { SUB_CAP } from '../types'
import { useAppStore } from '../store/useAppStore'
import { IconPicker } from './IconPicker'

type Props = {
  player: Player
  placedOnMap: boolean
  canMoveToSub: boolean
}

export function RosterItem({ player, placedOnMap, canMoveToSub }: Props) {
  const renamePlayer = useAppStore((s) => s.renamePlayer)
  const setIcon = useAppStore((s) => s.setIcon)
  const cycleMode = useAppStore((s) => s.cycleMode)
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

  const toggleMode = () => {
    const ok = cycleMode(player.id)
    if (!ok) {
      alert(`Sub roster is full (max ${SUB_CAP}).`)
    }
  }

  const moveDisabled = player.mode === 'join' && !canMoveToSub

  return (
    <div
      ref={setNodeRef}
      className={
        'flex items-center gap-2 px-2 py-1.5 rounded border ' +
        (placedOnMap
          ? 'border-indigo-500/60 bg-slate-800/60'
          : 'border-slate-700 bg-slate-800/30') +
        (isDragging ? ' opacity-40' : '')
      }
    >
      <button
        type="button"
        className="dnd-handle cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-200 shrink-0"
        title="Drag to map"
        {...listeners}
        {...attributes}
      >
        <GripVertical size={16} />
      </button>

      <IconPicker
        value={player.icon}
        onChange={(next) => setIcon(player.id, next)}
      />

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitName}
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
          onClick={() => {
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

      <button
        type="button"
        onClick={toggleMode}
        disabled={moveDisabled}
        title={
          moveDisabled
            ? `Sub roster is full (${SUB_CAP})`
            : player.mode === 'join'
              ? 'Move to Sub'
              : 'Move to Join'
        }
        className={
          'shrink-0 w-7 h-7 grid place-items-center rounded ' +
          (moveDisabled
            ? 'text-slate-600 cursor-not-allowed'
            : 'text-slate-300 hover:bg-slate-700')
        }
      >
        <ArrowLeftRight size={14} />
      </button>
    </div>
  )
}
