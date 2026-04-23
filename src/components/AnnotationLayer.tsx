import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { AnnotationItem } from './AnnotationItem'
import { MAP_HEIGHT, MAP_WIDTH } from '../types'

type Props = {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function AnnotationLayer({ selectedId, onSelect }: Props) {
  const annotations = useAppStore((s) => s.annotations)
  const removeAnnotation = useAppStore((s) => s.removeAnnotation)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedId) return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        removeAnnotation(selectedId)
        onSelect(null)
      }
      if (e.key === 'Escape') onSelect(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, removeAnnotation, onSelect])

  return (
    <svg
      width={MAP_WIDTH}
      height={MAP_HEIGHT}
      className="absolute inset-0"
      style={{ overflow: 'visible' }}
      onPointerDown={(e) => {
        // clicks on background deselect; individual annotations stopPropagation
        if (e.target === e.currentTarget) onSelect(null)
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          {/* context-stroke makes the arrowhead inherit the referring line's stroke color */}
          <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
        </marker>
      </defs>
      {annotations.map((a) => (
        <AnnotationItem
          key={a.id}
          annotation={a}
          selected={selectedId === a.id}
          onSelect={() => onSelect(a.id)}
        />
      ))}
    </svg>
  )
}
