import { request } from './client'

export function getProducts(options = {}) {
  return request('/products/', {
    method: 'GET',
    signal: options.signal,
  })
}
