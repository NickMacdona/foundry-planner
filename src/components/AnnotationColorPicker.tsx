import { Check } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { ANNOTATION_COLORS, DEFAULT_ANNOTATION_COLOR } from '../types'

type Props = {
  selectedId: string | null
}

export function AnnotationColorPicker({ selectedId }: Props) {
  const annotation = useAppStore((s) =>
    selectedId ? s.annotations.find((a) => a.id === selectedId) : null,
  )
  const updateAnnotation = useAppStore((s) => s.updateAnnotation)

  if (!annotation) return null

  const current = annotation.color ?? DEFAULT_ANNOTATION_COLOR

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-slate-900/90 border border-slate-700 rounded-lg px-2 py-1.5 shadow-lg">
      <span className="text-xs text-slate-400 pr-2 border-r border-slate-700">
        Color
      </span>
      {ANNOTATION_COLORS.map((c) => {
        const active = c.toLowerCase() === current.toLowerCase()
        return (
          <button
            key={c}
            type="button"
            onClick={() => updateAnnotation(annotation.id, { color: c })}
            className="w-6 h-6 rounded-full grid place-items-center border transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              borderColor: active ? '#f8fafc' : 'rgba(255,255,255,0.15)',
              boxShadow: active ? '0 0 0 2px rgba(99,102,241,0.9)' : undefined,
            }}
            title={c}
          >
            {active && (
              <Check
                size={14}
                color={isLightColor(c) ? '#111827' : '#ffffff'}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

function isLightColor(hex: string): boolean {
  const m = hex.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i)
  if (!m) return false
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  // Perceptual luminance; above ~160 counts as "light enough that a dark check reads better"
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}
