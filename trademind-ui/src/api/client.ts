const DEFAULT_API_BASE_URL = '/api'

function getApiBaseUrl(): string {
  const raw = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_API_BASE_URL).trim()
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined | null>): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${getApiBaseUrl()}${normalizedPath}`, window.location.origin)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

export async function apiGet<T>(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>
): Promise<T> {
  const resp = await fetch(buildUrl(path, query), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    const message = text || `Request failed (${resp.status})`
    throw new Error(message)
  }

  return (await resp.json()) as T
}
