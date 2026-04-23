import { Plus, Shield, Swords } from 'lucide-react'
import type { IconType } from '../types'

const ORDER: IconType[] = ['shield', 'swords', 'plus']

type Props = {
  value: IconType
  onChange: (next: IconType) => void
  size?: number
}

export function IconGlyph({ type, size = 18 }: { type: IconType; size?: number }) {
  switch (type) {
    case 'shield':
      return <Shield size={size} />
    case 'swords':
      return <Swords size={size} />
    case 'plus':
      return <Plus size={size} />
  }
}

export function IconPicker({ value, onChange, size = 18 }: Props) {
  const cycle = () => {
    const i = ORDER.indexOf(value)
    onChange(ORDER[(i + 1) % ORDER.length])
  }
  return (
    <button
      type="button"
      onClick={cycle}
      title="Change icon"
      className="shrink-0 w-8 h-8 rounded grid place-items-center bg-slate-700 hover:bg-slate-600 text-slate-100"
    >
      <IconGlyph type={value} size={size} />
    </button>
  )
}
