import type { RosterMode } from '../types'
import { SUB_CAP } from '../types'

type Props = {
  active: RosterMode
  onChange: (m: RosterMode) => void
  joinCount: number
  subCount: number
}

export function RosterTabs({ active, onChange, joinCount, subCount }: Props) {
  return (
    <div className="flex bg-slate-800 rounded-md p-1 gap-1 text-sm">
      <TabButton
        active={active === 'join'}
        onClick={() => onChange('join')}
        label="Join"
        count={`${joinCount}`}
      />
      <TabButton
        active={active === 'sub'}
        onClick={() => onChange('sub')}
        label="Sub"
        count={`${subCount} / ${SUB_CAP}`}
      />
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex-1 px-3 py-1.5 rounded font-medium transition-colors ' +
        (active
          ? 'bg-indigo-600 text-white'
          : 'text-slate-300 hover:bg-slate-700')
      }
    >
      {label}
      <span className="ml-2 text-xs opacity-70">{count}</span>
    </button>
  )
}
