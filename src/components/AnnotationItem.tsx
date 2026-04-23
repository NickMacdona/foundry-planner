import { useEffect, useRef, useState } from 'react'
import type { Annotation } from '../types'
import { useAppStore } from '../store/useAppStore'
import { useMapContext } from './MapContext'
import { clampToMap } from '../lib/grid'

type Props = {
  annotation: Annotation
  selected: boolean
  onSelect: () => void
}

type DragMode =
  | { kind: 'none' }
  | { kind: 'move'; startX: number; startY: number; origX: number; origY: number }
  | {
      kind: 'resize'
      handle: 'nw' | 'ne' | 'sw' | 'se'
      startX: number
      startY: number
      origX: number
      origY: number
      origW: number
      origH: number
    }

export function AnnotationItem({ annotation, selected, onSelect }: Props) {
  const updateAnnotation = useAppStore((s) => s.updateAnnotation)
  const map = useMapContext()
  const [drag, setDrag] = useState<DragMode>({ kind: 'none' })
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (drag.kind === 'none') return

    const onMove = (e: PointerEvent) => {
      const scale = map?.getTransform().scale ?? 1
      if (drag.kind === 'move') {
        const dx = (e.clientX - drag.startX) / scale
        const dy = (e.clientY - drag.startY) / scale
        const next = clampToMap(drag.origX + dx, drag.origY + dy)
        updateAnnotation(annotation.id, { x: next.x, y: next.y })
      } else if (drag.kind === 'resize') {
        const dx = (e.clientX - drag.startX) / scale
        const dy = (e.clientY - drag.startY) / scale
        let x = drag.origX
        let y = drag.origY
        let w = drag.origW
        let h = drag.origH
        if (drag.handle === 'nw') {
          x = drag.origX + dx
          y = drag.origY + dy
          w = drag.origW - dx
          h = drag.origH - dy
        } else if (drag.handle === 'ne') {
          y = drag.origY + dy
          w = drag.origW + dx
          h = drag.origH - dy
        } else if (drag.handle === 'sw') {
          x = drag.origX + dx
          w = drag.origW - dx
          h = drag.origH + dy
        } else {
          w = drag.origW + dx
          h = drag.origH + dy
        }
        updateAnnotation(annotation.id, { x, y, w, h })
      }
    }
    const onUp = () => setDrag({ kind: 'none' })
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [drag, annotation.id, updateAnnotation, map])

  const startMove = (e: React.PointerEvent) => {
    e.stopPropagation()
    onSelect()
    setDrag({
      kind: 'move',
      startX: e.clientX,
      startY: e.clientY,
      origX: annotation.x,
      origY: annotation.y,
    })
  }

  const startResize =
    (handle: 'nw' | 'ne' | 'sw' | 'se') => (e: React.PointerEvent) => {
      e.stopPropagation()
      setDrag({
        kind: 'resize',
        handle,
        startX: e.clientX,
        startY: e.clientY,
        origX: annotation.x,
        origY: annotation.y,
        origW: annotation.w,
        origH: annotation.h,
      })
    }

  const { x, y, w, h } = annotation

  let body: React.ReactNode = null
  switch (annotation.type) {
    case 'box':
      body = (
        <rect
          className="annotation-hit"
          x={x}
          y={y}
          width={Math.max(4, w)}
          height={Math.max(4, h)}
          fill="rgba(251, 191, 36, 0.12)"
          stroke="#fbbf24"
          strokeWidth={2}
          onPointerDown={startMove}
          style={{ cursor: 'move' }}
        />
      )
      break
    case 'circle':
      body = (
        <ellipse
          className="annotation-hit"
          cx={x + w / 2}
          cy={y + h / 2}
          rx={Math.max(2, Math.abs(w / 2))}
          ry={Math.max(2, Math.abs(h / 2))}
          fill="rgba(251, 191, 36, 0.12)"
          stroke="#fbbf24"
          strokeWidth={2}
          onPointerDown={startMove}
          style={{ cursor: 'move' }}
        />
      )
      break
    case 'arrow':
      body = (
        <>
          <line
            className="annotation-hit"
            x1={x}
            y1={y}
            x2={x + w}
            y2={y + h}
            stroke="#fbbf24"
            strokeWidth={3}
            markerEnd="url(#arrowhead)"
            onPointerDown={startMove}
            style={{ cursor: 'move' }}
          />
          <line
            x1={x}
            y1={y}
            x2={x + w}
            y2={y + h}
            stroke="transparent"
            strokeWidth={14}
            onPointerDown={startMove}
            className="annotation-hit"
            style={{ cursor: 'move' }}
          />
        </>
      )
      break
    case 'text':
      body = editing ? (
        <foreignObject
          x={x}
          y={y}
          width={Math.max(40, w)}
          height={Math.max(24, h)}
        >
          <TextEditor
            value={annotation.text ?? ''}
            onCommit={(next) => {
              updateAnnotation(annotation.id, { text: next })
              setEditing(false)
            }}
          />
        </foreignObject>
      ) : (
        <foreignObject
          x={x}
          y={y}
          width={Math.max(40, w)}
          height={Math.max(24, h)}
          className="annotation-hit"
          onPointerDown={startMove}
          onDoubleClick={(e) => {
            e.stopPropagation()
            setEditing(true)
          }}
          style={{ cursor: 'move' }}
        >
          <div
            className="w-full h-full px-2 py-1 rounded border border-amber-400 bg-amber-400/10 text-amber-200 text-sm font-medium overflow-hidden"
            style={{ wordBreak: 'break-word' }}
          >
            {annotation.text || 'Text'}
          </div>
        </foreignObject>
      )
      break
  }

  const bboxX = annotation.type === 'arrow' ? Math.min(x, x + w) : x
  const bboxY = annotation.type === 'arrow' ? Math.min(y, y + h) : y
  const bboxW = annotation.type === 'arrow' ? Math.abs(w) : w
  const bboxH = annotation.type === 'arrow' ? Math.abs(h) : h

  return (
    <g>
      {body}
      {selected && (
        <>
          <rect
            x={bboxX - 2}
            y={bboxY - 2}
            width={Math.max(4, bboxW) + 4}
            height={Math.max(4, bboxH) + 4}
            fill="none"
            stroke="#60a5fa"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            pointerEvents="none"
          />
          <ResizeHandle cx={bboxX} cy={bboxY} onDown={startResize('nw')} />
          <ResizeHandle cx={bboxX + bboxW} cy={bboxY} onDown={startResize('ne')} />
          <ResizeHandle cx={bboxX} cy={bboxY + bboxH} onDown={startResize('sw')} />
          <ResizeHandle
            cx={bboxX + bboxW}
            cy={bboxY + bboxH}
            onDown={startResize('se')}
          />
        </>
      )}
    </g>
  )
}

function ResizeHandle({
  cx,
  cy,
  onDown,
}: {
  cx: number
  cy: number
  onDown: (e: React.PointerEvent) => void
}) {
  return (
    <rect
      className="annotation-hit"
      x={cx - 5}
      y={cy - 5}
      width={10}
      height={10}
      fill="#60a5fa"
      stroke="#1e293b"
      strokeWidth={1}
      style={{ cursor: 'nwse-resize' }}
      onPointerDown={onDown}
    />
  )
}

function TextEditor({
  value,
  onCommit,
}: {
  value: string
  onCommit: (v: string) => void
}) {
  const [v, setV] = useState(value)
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])
  return (
    <textarea
      ref={ref}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => onCommit(v)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          onCommit(v)
        }
        if (e.key === 'Escape') onCommit(value)
      }}
      className="w-full h-full px-2 py-1 rounded border border-amber-400 bg-slate-900 text-amber-100 text-sm resize-none outline-none"
    />
  )
}
