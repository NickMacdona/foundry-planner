import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { ANNOTATION_COLORS, DEFAULT_ANNOTATION_COLOR } from '../types'

type Props = {
  selectedId: string | null
}

export function AnnotationColorPicker({ selectedId }: Props) {
  const currentColor = useAppStore((s) => s.currentColor)
  const setCurrentColor = useAppStore((s) => s.setCurrentColor)
  const selectedAnnotation = useAppStore((s) =>
    selectedId ? s.annotations.find((a) => a.id === selectedId) ?? null : null,
  )
  const updateAnnotation = useAppStore((s) => s.updateAnnotation)

  const active =
    (selectedAnnotation?.color ?? currentColor) || DEFAULT_ANNOTATION_COLOR

  const [hexDraft, setHexDraft] = useState(active)

  // Keep the hex field in sync when selection/current color changes externally.
  useEffect(() => {
    setHexDraft(active)
  }, [active])

  const applyColor = (c: string) => {
    setCurrentColor(c)
    if (selectedAnnotation) {
      updateAnnotation(selectedAnnotation.id, { color: c })
    }
  }

  const commitHex = () => {
    const normalized = normalizeHex(hexDraft)
    if (normalized) {
      applyColor(normalized)
      setHexDraft(normalized)
    } else {
      setHexDraft(active) // reject; revert
    }
  }

  const label = selectedAnnotation ? 'Selection' : 'New'

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-400 pr-2 border-r border-slate-700 w-16 text-center">
        {label}
      </span>
      {ANNOTATION_COLORS.map((c) => {
        const isActive = c.toLowerCase() === active.toLowerCase()
        return (
          <button
            key={c}
            type="button"
            onClick={() => applyColor(c)}
            className="w-6 h-6 rounded-full grid place-items-center border transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              borderColor: isActive ? '#f8fafc' : 'rgba(255,255,255,0.15)',
              boxShadow: isActive
                ? '0 0 0 2px rgba(99,102,241,0.9)'
                : undefined,
            }}
            title={c}
          >
            {isActive && (
              <Check
                size={14}
                color={isLightColor(c) ? '#111827' : '#ffffff'}
              />
            )}
          </button>
        )
      })}
      <div className="pl-2 ml-1 border-l border-slate-700 flex items-center gap-1.5">
        <span
          className="w-5 h-5 rounded border border-slate-600"
          style={{ backgroundColor: active }}
          title={active}
        />
        <input
          value={hexDraft}
          onChange={(e) => setHexDraft(e.target.value)}
          onBlur={commitHex}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitHex()
            }
            if (e.key === 'Escape') {
              setHexDraft(active)
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          spellCheck={false}
          placeholder="#rrggbb"
          className="w-[88px] bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-slate-100 outline-none focus:border-indigo-400"
          maxLength={7}
        />
      </div>
    </div>
  )
}

function normalizeHex(input: string): string | null {
  const s = input.trim().replace(/^#/, '').toLowerCase()
  if (/^[\da-f]{6}$/.test(s)) return `#${s}`
  if (/^[\da-f]{3}$/.test(s)) {
    return `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`
  }
  return null
}

function isLightColor(hex: string): boolean {
  const m = hex.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i)
  if (!m) return false
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}
