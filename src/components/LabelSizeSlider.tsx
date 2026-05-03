type Props = {
  value: number
  onChange: (size: number) => void
}

export function LabelSizeSlider({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 whitespace-nowrap">Text</span>
      <input
        type="range"
        min={8}
        max={20}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 accent-indigo-500"
      />
      <span className="text-xs text-slate-400 w-6 text-right">{value}</span>
    </div>
  )
}
