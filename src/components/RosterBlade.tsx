import { PanelRightClose } from 'lucide-react'
import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { RosterItem } from './RosterItem'
import { RosterTabs } from './RosterTabs'

type Props = {
  onCollapse: () => void
}

export function RosterBlade({ onCollapse }: Props) {
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
    <aside className="h-full w-[340px] flex flex-col border-l border-slate-700 bg-slate-900/60">
      <header className="p-3 border-b border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-100">Roster</h1>
          <button
            type="button"
            onClick={onCollapse}
            title="Hide roster"
            className="w-8 h-8 grid place-items-center rounded text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <PanelRightClose size={18} />
          </button>
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
