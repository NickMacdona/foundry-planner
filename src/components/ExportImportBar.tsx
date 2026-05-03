import { Copy, Download, RotateCcw, Upload } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { exportState, importState } from '../lib/serialize'

type Mode = null | 'export' | 'import'

export function ExportImportBar() {
  const [mode, setMode] = useState<Mode>(null)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const openExport = async () => {
    const state = useAppStore.getState()
    const encoded = await exportState({
      players: state.players,
      phases: state.phases,
      activePhaseId: state.activePhaseId,
      activeTab: state.activeTab,
      currentColor: state.currentColor,
      labelSize: state.labelSize,
    })
    setText(encoded)
    setError(null)
    setMode('export')
  }

  const openImport = () => {
    setText('')
    setError(null)
    setMode('import')
  }

  const doImport = async () => {
    try {
      const parsed = await importState(text)
      useAppStore.getState().replaceState(parsed)
      setMode(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const doClear = () => {
    if (confirm('Reset all players, placements, and annotations?')) {
      useAppStore.getState().reset()
    }
  }

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard can fail in some browsers; text remains visible for manual copy.
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openExport}
          className="flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
        >
          <Download size={16} />
          Export
        </button>
        <button
          type="button"
          onClick={openImport}
          className="flex items-center gap-2 px-4 py-2 rounded border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-medium"
        >
          <Upload size={16} />
          Import
        </button>
        <button
          type="button"
          title="Reset all state"
          onClick={doClear}
          className="w-9 h-9 grid place-items-center rounded text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {mode !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4"
          onClick={() => setMode(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-slate-100 text-lg font-semibold">
              {mode === 'export' ? 'Export state' : 'Import state'}
            </h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              readOnly={mode === 'export'}
              placeholder={mode === 'import' ? 'Paste exported base64 string…' : ''}
              className="w-full h-48 bg-slate-950 border border-slate-700 rounded p-2 text-xs font-mono text-slate-200 resize-none"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              {mode === 'export' ? (
                <button
                  type="button"
                  onClick={copyText}
                  className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm flex items-center gap-1.5"
                >
                  <Copy size={14} /> Copy
                </button>
              ) : (
                <button
                  type="button"
                  onClick={doImport}
                  className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
                >
                  Import
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode(null)}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
