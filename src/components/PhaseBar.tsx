import { Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'

export function PhaseBar() {
  const phases = useAppStore((s) => s.phases)
  const activePhaseId = useAppStore((s) => s.activePhaseId)
  const setActivePhase = useAppStore((s) => s.setActivePhase)
  const addPhase = useAppStore((s) => s.addPhase)
  const removePhase = useAppStore((s) => s.removePhase)
  const renamePhase = useAppStore((s) => s.renamePhase)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editingId])

  const startRename = (id: string, name: string) => {
    setEditingId(id)
    setDraft(name)
  }

  const commitRename = () => {
    if (editingId) {
      const trimmed = draft.trim()
      if (trimmed) renamePhase(editingId, trimmed)
      setEditingId(null)
    }
  }

  return (
    <div className="flex items-stretch bg-slate-950 border-b border-slate-700 overflow-x-auto">
      {phases.map((phase) => {
        const isActive = phase.id === activePhaseId
        const isEditing = editingId === phase.id

        return (
          <div
            key={phase.id}
            className={
              'group relative flex items-center gap-1 px-3 py-2 text-sm cursor-pointer border-b-2 transition-colors min-w-0 shrink-0 ' +
              (isActive
                ? 'border-indigo-500 text-white bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30')
            }
            onClick={() => !isEditing && setActivePhase(phase.id)}
            onDoubleClick={() => startRename(phase.id, phase.name)}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename()
                  if (e.key === 'Escape') setEditingId(null)
                }}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-600 rounded px-1.5 py-0.5 text-sm text-slate-100 w-24"
                maxLength={30}
              />
            ) : (
              <span className="truncate max-w-[120px]">{phase.name}</span>
            )}

            {phases.length > 1 && !isEditing && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removePhase(phase.id)
                }}
                title="Remove phase"
                className="opacity-0 group-hover:opacity-100 w-5 h-5 grid place-items-center rounded text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-opacity"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )
      })}

      <button
        type="button"
        onClick={addPhase}
        title="Add phase"
        className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-slate-200 hover:bg-slate-800/30 shrink-0"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
