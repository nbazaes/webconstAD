const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api'

async function request(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const body = await response.json()
      detail = body?.detail || body?.error || detail
    } catch {
      // Use HTTP status as fallback when there is no JSON body.
    }
    throw new Error(detail)
  }

  return response.json()
}

export { request, API_BASE_URL }
