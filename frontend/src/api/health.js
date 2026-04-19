import { request } from './client'

export function getHealthStatus(options = {}) {
  return request('/health/', {
    method: 'GET',
    signal: options.signal,
  })
}
