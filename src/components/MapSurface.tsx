import { useDroppable } from '@dnd-kit/core'
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch'
import { MAP_HEIGHT, MAP_WIDTH } from '../types'
import { useAppStore } from '../store/useAppStore'
import { MapGrid } from './MapGrid'
import { PlacedIcon } from './PlacedIcon'
import { AnnotationLayer } from './AnnotationLayer'
import { MapProvider } from './MapContext'

export type MapSurfaceHandle = {
  getMapRect: () => DOMRect | null
  getTransform: () => { positionX: number; positionY: number; scale: number }
}

export const MapSurface = forwardRef<MapSurfaceHandle>(function MapSurface(
  _props,
  ref,
) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const rzppRef = useRef<ReactZoomPanPinchRef>(null)

  const players = useAppStore((s) => s.players)
  const placements = useAppStore((s) => s.placements)
  const playersById = new Map(players.map((p) => [p.id, p]))

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: 'map' })

  const handle = useMemo<MapSurfaceHandle>(
    () => ({
      getMapRect: () => wrapperRef.current?.getBoundingClientRect() ?? null,
      getTransform: () => {
        const s = rzppRef.current?.state
        return {
          positionX: s?.positionX ?? 0,
          positionY: s?.positionY ?? 0,
          scale: s?.scale ?? 1,
        }
      },
    }),
    [],
  )

  useImperativeHandle(ref, () => handle, [handle])

  const setRefs = (el: HTMLDivElement | null) => {
    wrapperRef.current = el
    setDropRef(el)
  }

  return (
    <MapProvider value={handle}>
      <div
        ref={setRefs}
        className={
          'relative h-full w-full overflow-hidden bg-slate-950 ' +
          (isOver ? 'ring-2 ring-indigo-400/50 ring-inset' : '')
        }
      >
        <TransformWrapper
          ref={rzppRef}
          minScale={0.25}
          maxScale={4}
          initialScale={0.8}
          centerOnInit
          limitToBounds={false}
          smooth={false}
          doubleClick={{ disabled: true }}
          wheel={{ step: 0.1 }}
          panning={{
            excluded: ['dnd-handle', 'annotation-hit'],
            velocityDisabled: true,
          }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
          >
            <div
              className="relative"
              style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
            >
              <MapGrid />
              <AnnotationLayer />
              {placements.map((pl) => {
                const p = playersById.get(pl.playerId)
                if (!p) return null
                return (
                  <PlacedIcon
                    key={pl.playerId}
                    player={p}
                    x={pl.x}
                    y={pl.y}
                    scale={rzppRef.current?.state?.scale ?? 1}
                  />
                )
              })}
            </div>
          </TransformComponent>
        </TransformWrapper>

        <div className="absolute bottom-2 left-2 z-30 text-xs text-slate-400 bg-slate-900/80 border border-slate-700 rounded px-2 py-1">
          Scroll to zoom · Drag background to pan · Drag icons to move
        </div>
      </div>
    </MapProvider>
  )
})
