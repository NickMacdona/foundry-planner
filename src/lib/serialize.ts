import type { AppState } from '../types'

export function exportState(state: AppState): string {
  const json = JSON.stringify(state)
  return btoa(encodeURIComponent(json))
}

export function importState(encoded: string): AppState {
  const trimmed = encoded.trim()
  if (!trimmed) throw new Error('Empty import string')
  let json: string
  try {
    json = decodeURIComponent(atob(trimmed))
  } catch {
    throw new Error('Invalid base64 payload')
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Payload is not valid JSON')
  }
  if (!isAppState(parsed)) {
    throw new Error('Payload does not match expected shape')
  }
  return parsed
}

function isAppState(v: unknown): v is AppState {
  if (!v || typeof v !== 'object') return false
  const s = v as Record<string, unknown>
  return (
    Array.isArray(s.players) &&
    Array.isArray(s.placements) &&
    Array.isArray(s.annotations) &&
    (s.activeTab === 'join' || s.activeTab === 'sub')
  )
}
