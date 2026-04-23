import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { AnnotationItem } from './AnnotationItem'
import { MAP_HEIGHT, MAP_WIDTH } from '../types'

export function AnnotationLayer() {
  const annotations = useAppStore((s) => s.annotations)
  const removeAnnotation = useAppStore((s) => s.removeAnnotation)
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
        setSelectedId(null)
      }
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, removeAnnotation])

  return (
    <svg
      width={MAP_WIDTH}
      height={MAP_HEIGHT}
      className="absolute inset-0"
      style={{ overflow: 'visible' }}
      onPointerDown={(e) => {
        // clicks on background deselect; individual annotations stopPropagation
        if (e.target === e.currentTarget) setSelectedId(null)
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
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
        </marker>
      </defs>
      {annotations.map((a) => (
        <AnnotationItem
          key={a.id}
          annotation={a}
          selected={selectedId === a.id}
          onSelect={() => setSelectedId(a.id)}
        />
      ))}
    </svg>
  )
}
