import { useDraggable } from '@dnd-kit/core'
import {
  ArrowRight,
  Circle,
  ClipboardPaste,
  Download,
  RotateCcw,
  Square,
  Type,
  Upload,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { AnnotationType, RosterMode } from '../types'
import { AnnotationColorPicker } from './AnnotationColorPicker'
import { ImportNamesModal } from './ImportNamesModal'
import { RosterItem } from './RosterItem'
import { SUB_CAP } from '../types'
import { exportState, importState } from '../lib/serialize'

type MobileTab = RosterMode | 'annotate'

type Props = {
  selectedAnnotationId: string | null
}

export function MobilePanel({ selectedAnnotationId }: Props) {
  const activeTab = useAppStore((s) => s.activeTab)
  const setActiveTab = useAppStore((s) => s.setActiveTab)
  const [mobileTab, setMobileTab] = useState<MobileTab>(activeTab)
  const [importOpen, setImportOpen] = useState(false)

  const players = useAppStore((s) => s.players)
  const placements = useAppStore((s) => s.placements)
  const placedIds = useMemo(
    () => new Set(placements.map((p) => p.playerId)),
    [placements],
  )
  const joinCount = players.filter((p) => p.mode === 'join').length
  const subCount = players.filter((p) => p.mode === 'sub').length

  const onSelectTab = (t: MobileTab) => {
    setMobileTab(t)
    if (t === 'join' || t === 'sub') setActiveTab(t)
  }

  const visible =
    mobileTab === 'annotate' ? [] : players.filter((p) => p.mode === mobileTab)

  return (
    <div className="h-full w-full flex flex-col border-t border-slate-700 bg-slate-900/80">
      <div className="flex items-stretch text-sm">
        <MobileTabButton
          active={mobileTab === 'join'}
          onClick={() => onSelectTab('join')}
          label="Join"
          count={`${joinCount}`}
        />
        <MobileTabButton
          active={mobileTab === 'sub'}
          onClick={() => onSelectTab('sub')}
          label="Sub"
          count={`${subCount} / ${SUB_CAP}`}
        />
        <MobileTabButton
          active={mobileTab === 'annotate'}
          onClick={() => onSelectTab('annotate')}
          label="Annotate"
        />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {mobileTab === 'annotate' ? (
          <AnnotatePanel selectedAnnotationId={selectedAnnotationId} />
        ) : (
          <div className="p-2 space-y-1.5">
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded border border-dashed border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500 text-sm"
            >
              <ClipboardPaste size={14} /> Import names
            </button>
            {visible.map((p) => (
              <RosterItem
                key={p.id}
                player={p}
                placedOnMap={placedIds.has(p.id)}
              />
            ))}
          </div>
        )}
      </div>

      {importOpen && mobileTab !== 'annotate' && (
        <ImportNamesModal
          mode={mobileTab}
          onClose={() => setImportOpen(false)}
        />
      )}
    </div>
  )
}

function MobileTabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex-1 px-3 py-2.5 font-medium border-b-2 transition-colors ' +
        (active
          ? 'border-indigo-500 text-white bg-slate-800/60'
          : 'border-transparent text-slate-400 hover:text-slate-200')
      }
    >
      {label}
      {count && <span className="ml-2 text-xs opacity-70">{count}</span>}
    </button>
  )
}

function AnnotatePanel({
  selectedAnnotationId,
}: {
  selectedAnnotationId: string | null
}) {
  return (
    <div className="p-3 space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <ToolTile type="arrow" label="Arrow" icon={<ArrowRight size={18} />} />
        <ToolTile type="box" label="Box" icon={<Square size={18} />} />
        <ToolTile type="circle" label="Circle" icon={<Circle size={18} />} />
        <ToolTile type="text" label="Text" icon={<Type size={18} />} />
      </div>

      <div className="flex flex-wrap items-center gap-2 border border-slate-700 rounded-lg p-2 bg-slate-900/60">
        <AnnotationColorPicker selectedId={selectedAnnotationId} />
      </div>

      <ExportImportRow />
    </div>
  )
}

function ToolTile({
  type,
  label,
  icon,
}: {
  type: AnnotationType
  label: string
  icon: ReactNode
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `mtool-${type}`,
    data: { kind: 'new-annotation', annotationType: type },
  })
  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={
        'flex flex-col items-center justify-center gap-1 px-2 py-3 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs cursor-grab active:cursor-grabbing ' +
        (isDragging ? 'opacity-40' : '')
      }
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function ExportImportRow() {
  const [mode, setMode] = useState<null | 'export' | 'import'>(null)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const openExport = () => {
    const state = useAppStore.getState()
    setText(
      exportState({
        players: state.players,
        placements: state.placements,
        annotations: state.annotations,
        activeTab: state.activeTab,
        currentColor: state.currentColor,
      }),
    )
    setError(null)
    setMode('export')
  }

  const openImport = () => {
    setText('')
    setError(null)
    setMode('import')
  }

  const doImport = () => {
    try {
      useAppStore.getState().replaceState(importState(text))
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
      // fall through; user can select and copy manually
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openExport}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
        >
          <Download size={16} /> Export
        </button>
        <button
          type="button"
          onClick={openImport}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-medium"
        >
          <Upload size={16} /> Import
        </button>
        <button
          type="button"
          onClick={doClear}
          title="Reset all state"
          className="w-10 h-10 grid place-items-center rounded text-slate-400 hover:bg-slate-700 hover:text-white"
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
              placeholder={
                mode === 'import' ? 'Paste exported base64 string…' : ''
              }
              className="w-full h-48 bg-slate-950 border border-slate-700 rounded p-2 text-xs font-mono text-slate-200 resize-none"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              {mode === 'export' ? (
                <button
                  type="button"
                  onClick={copyText}
                  className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
                >
                  Copy
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
