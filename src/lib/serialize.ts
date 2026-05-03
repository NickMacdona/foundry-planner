import type { AppState } from '../types'

const COMPRESSED_PREFIX = 'z:'

export async function exportState(state: AppState): Promise<string> {
  const json = JSON.stringify(state)
  const bytes = new TextEncoder().encode(json)
  const cs = new CompressionStream('deflate-raw')
  const writer = cs.writable.getWriter()
  writer.write(bytes as unknown as BufferSource)
  writer.close()
  const compressed = await new Response(cs.readable).arrayBuffer()
  const binary = String.fromCharCode(...new Uint8Array(compressed))
  return COMPRESSED_PREFIX + btoa(binary)
}

export async function importState(encoded: string): Promise<AppState> {
  const trimmed = encoded.trim()
  if (!trimmed) throw new Error('Empty import string')

  let json: string
  if (trimmed.startsWith(COMPRESSED_PREFIX)) {
    json = await decompressPayload(trimmed.slice(COMPRESSED_PREFIX.length))
  } else {
    json = decodeLegacy(trimmed)
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

async function decompressPayload(b64: string): Promise<string> {
  let bytes: Uint8Array
  try {
    bytes = new Uint8Array([...atob(b64)].map((c) => c.charCodeAt(0)))
  } catch {
    throw new Error('Invalid base64 payload')
  }
  const ds = new DecompressionStream('deflate-raw')
  const writer = ds.writable.getWriter()
  writer.write(bytes as unknown as BufferSource)
  writer.close()
  const decompressed = await new Response(ds.readable).arrayBuffer()
  return new TextDecoder().decode(decompressed)
}

function decodeLegacy(b64: string): string {
  try {
    return decodeURIComponent(atob(b64))
  } catch {
    throw new Error('Invalid base64 payload')
  }
}

function isAppState(v: unknown): v is AppState {
  if (!v || typeof v !== 'object') return false
  const s = v as Record<string, unknown>
  return (
    Array.isArray(s.players) &&
    Array.isArray(s.phases) &&
    typeof s.activePhaseId === 'string' &&
    (s.activeTab === 'join' || s.activeTab === 'sub')
  )
}
