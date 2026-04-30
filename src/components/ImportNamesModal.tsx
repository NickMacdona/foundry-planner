import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { RosterMode } from '../types'

type Props = {
  mode: RosterMode
  onClose: () => void
}

function parseNames(raw: string): string[] {
  return raw
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean)
}

export function ImportNamesModal({ mode, onClose }: Props) {
  const [text, setText] = useState('')
  const importPlayerNames = useAppStore((s) => s.importPlayerNames)
  const slotCount = useAppStore(
    (s) => s.players.filter((p) => p.mode === mode).length,
  )

  const names = parseNames(text)
  const label = mode === 'join' ? 'Join' : 'Sub'

  const doImport = () => {
    if (names.length === 0) return
    importPlayerNames(mode, names)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-xl p-4 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-slate-100 text-lg font-semibold">
          Import {label} names
        </h2>
        <p className="text-slate-400 text-sm">
          Paste a comma-separated list of names. {slotCount} slots available.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Alice, Bob, Charlie\nor one name per line"}
          className="w-full h-48 bg-slate-950 border border-slate-700 rounded p-2 text-sm font-mono text-slate-200 resize-none"
          autoFocus
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {names.length} name{names.length !== 1 ? 's' : ''} detected
            {names.length > slotCount && (
              <span className="text-amber-400 ml-1">
                (only first {slotCount} will be used)
              </span>
            )}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={doImport}
              disabled={names.length === 0}
              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm"
            >
              Import
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
