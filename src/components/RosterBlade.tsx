import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { RosterItem } from './RosterItem'
import { RosterTabs } from './RosterTabs'
import { ExportImportBar } from './ExportImportBar'

export function RosterBlade() {
  const players = useAppStore((s) => s.players)
  const placements = useAppStore((s) => s.placements)
  const activeTab = useAppStore((s) => s.activeTab)
  const setActiveTab = useAppStore((s) => s.setActiveTab)

  const placedIds = useMemo(
    () => new Set(placements.map((p) => p.playerId)),
    [placements],
  )

  const joinCount = players.filter((p) => p.mode === 'join').length
  const subCount = players.filter((p) => p.mode === 'sub').length

  const visible = players.filter((p) => p.mode === activeTab)

  return (
    <aside className="h-full flex flex-col border-l border-slate-700 bg-slate-900/60">
      <header className="p-3 border-b border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-100">Roster</h1>
          <ExportImportBar />
        </div>
        <RosterTabs
          active={activeTab}
          onChange={setActiveTab}
          joinCount={joinCount}
          subCount={subCount}
        />
      </header>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {visible.map((p) => (
          <RosterItem
            key={p.id}
            player={p}
            placedOnMap={placedIds.has(p.id)}
          />
        ))}
      </div>
    </aside>
  )
}
