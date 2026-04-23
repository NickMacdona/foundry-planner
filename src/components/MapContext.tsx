import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { MapSurfaceHandle } from './MapSurface'

const MapContext = createContext<MapSurfaceHandle | null>(null)

export function MapProvider({
  value,
  children,
}: {
  value: MapSurfaceHandle
  children: ReactNode
}) {
  const stable = useMemo(() => value, [value])
  return <MapContext.Provider value={stable}>{children}</MapContext.Provider>
}

export function useMapContext() {
  return useContext(MapContext)
}
