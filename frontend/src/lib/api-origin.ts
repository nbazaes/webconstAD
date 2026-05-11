export function getApiOrigin(Astro: { request: Request; url: URL }) {
  const envOrigin = import.meta.env.PUBLIC_API_ORIGIN || import.meta.env.API_ORIGIN
  if (envOrigin) return envOrigin

  const forwardedProto = Astro.request.headers.get('x-forwarded-proto') || Astro.url.protocol.replace(':', '')
  const forwardedHost = Astro.request.headers.get('x-forwarded-host') || Astro.request.headers.get('host') || Astro.url.host
  const isLocalHost = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(forwardedHost)

  if (isLocalHost) {
    return 'http://127.0.0.1:8000'
  }

  return `${forwardedProto}://${forwardedHost}`
}
