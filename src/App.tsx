import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import { PanelRightOpen } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { BottomToolbar } from './components/BottomToolbar'
import { DragPreview, type ActiveDrag } from './components/DragPreview'
import { MapSurface, type MapSurfaceHandle } from './components/MapSurface'
import { MobilePanel } from './components/MobilePanel'
import { RosterBlade } from './components/RosterBlade'
import { clampToMap, snap, screenToMap } from './lib/grid'
import { useIsMobile } from './lib/useIsMobile'
import { useAppStore } from './store/useAppStore'
import type { AnnotationType } from './types'

export default function App() {
  const mapRef = useRef<MapSurfaceHandle>(null)
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(
    null,
  )
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)
  const [bladeOpen, setBladeOpen] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 768,
  )
  const isMobile = useIsMobile()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const placePlayer = useAppStore((s) => s.placePlayer)
  const movePlacement = useAppStore((s) => s.movePlacement)
  const addAnnotation = useAppStore((s) => s.addAnnotation)

  const onDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as ActiveDrag | undefined
    if (data) setActiveDrag(data)
  }, [])

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null)
      const { active, delta, activatorEvent } = event
      const data = active.data.current as
        | { kind: 'roster'; playerId: string }
        | { kind: 'placed'; playerId: string }
        | { kind: 'new-annotation'; annotationType: AnnotationType }
        | undefined
      if (!data) return

      const rect = mapRef.current?.getMapRect()
      const transform = mapRef.current?.getTransform()
      if (!rect || !transform) return

      const pointerEvent = activatorEvent as PointerEvent | MouseEvent
      const startX =
        'clientX' in pointerEvent ? pointerEvent.clientX : rect.left + rect.width / 2
      const startY =
        'clientY' in pointerEvent ? pointerEvent.clientY : rect.top + rect.height / 2
      const endX = startX + delta.x
      const endY = startY + delta.y

      if (
        endX < rect.left ||
        endX > rect.right ||
        endY < rect.top ||
        endY > rect.bottom
      ) {
        return
      }

      const map = screenToMap({ x: endX, y: endY }, rect, transform)

      if (data.kind === 'roster') {
        const snapped = clampToMap(snap(map.x), snap(map.y))
        placePlayer(data.playerId, snapped.x, snapped.y)
      } else if (data.kind === 'placed') {
        const existing = useAppStore
          .getState()
          .placements.find((p) => p.playerId === data.playerId)
        if (!existing) return
        const nx = existing.x + delta.x / transform.scale
        const ny = existing.y + delta.y / transform.scale
        const snapped = clampToMap(snap(nx), snap(ny))
        movePlacement(data.playerId, snapped.x, snapped.y)
      } else if (data.kind === 'new-annotation') {
        const next = clampToMap(map.x, map.y)
        addAnnotation(data.annotationType, next.x, next.y)
      }
    },
    [addAnnotation, movePlacement, placePlayer],
  )

  const onDragCancel = useCallback(() => setActiveDrag(null), [])

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {isMobile ? (
        <div
          className="h-full w-full grid"
          style={{
            gridTemplateColumns: '1fr',
            gridTemplateRows: '1fr 33vh',
            gridTemplateAreas: '"map" "panel"',
          }}
        >
          <div style={{ gridArea: 'map' }} className="min-h-0 min-w-0 relative">
            <MapSurface
              ref={mapRef}
              selectedAnnotationId={selectedAnnotationId}
              onSelectAnnotation={setSelectedAnnotationId}
            />
          </div>
          <div style={{ gridArea: 'panel' }} className="min-h-0 min-w-0">
            <MobilePanel selectedAnnotationId={selectedAnnotationId} />
          </div>
        </div>
      ) : (
        <div
          className="h-full w-full grid transition-[grid-template-columns] duration-200"
          style={{
            gridTemplateColumns: bladeOpen ? '1fr 340px' : '1fr 0px',
            gridTemplateRows: '1fr 72px',
            gridTemplateAreas: '"map blade" "bottom blade"',
          }}
        >
          <div style={{ gridArea: 'map' }} className="min-h-0 min-w-0 relative">
            <MapSurface
              ref={mapRef}
              selectedAnnotationId={selectedAnnotationId}
              onSelectAnnotation={setSelectedAnnotationId}
            />
            {!bladeOpen && (
              <button
                type="button"
                onClick={() => setBladeOpen(true)}
                title="Show roster"
                className="absolute top-3 right-3 z-30 w-10 h-10 grid place-items-center rounded-lg bg-slate-900/90 border border-slate-700 text-slate-100 shadow-lg hover:bg-slate-800"
              >
                <PanelRightOpen size={18} />
              </button>
            )}
          </div>
          <div style={{ gridArea: 'bottom' }} className="min-h-0 min-w-0">
            <BottomToolbar selectedAnnotationId={selectedAnnotationId} />
          </div>
          <div
            style={{ gridArea: 'blade' }}
            className="min-h-0 min-w-0 overflow-hidden"
          >
            <RosterBlade onCollapse={() => setBladeOpen(false)} />
          </div>
        </div>
      )}

      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {activeDrag ? <DragPreview active={activeDrag} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
