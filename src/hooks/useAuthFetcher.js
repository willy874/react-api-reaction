import { useCallback, useState, useRef } from 'react'
import { useTokenContext } from '../contexts'
import { Fetcher } from '../utils'

/**
 * @param {Response} response 
 * @returns {Promise<*>}
 */
function resolveContent(response) {
  if (response.headers.get('Content-Type').includes('application/json')) {
    return response.json()
  }
  return response.text()
}

/**
 * @typedef {Object} AuthFetcher
 * @property {unknown} data
 * @property {boolean} loading
 * @property {Error | null} error
 * @property {(url: string, options: RequestInit) => [Promise<*>, () => void]} send
 */
/** @type {() => AuthFetcher} */
export function useAuthFetcher() {
  const { token, refreshQueue, addRefreshQueue, onRefreshToken } = useTokenContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const send = useCallback((url, { headers, ...options }) => {
    let ignore = false
    const destructor = () => (ignore = true)
    setLoading(true)
    const $headers = new Headers(headers)
    $headers.set('Content-Type', 'application/json')
    $headers.set('Authorization', token)
    const fetcher = new Fetcher({
      ...options,
      url,
      headers: $headers,
    })
    const promise = fetcher
      .send()
      .then(([request, response]) => {
        if (ignore) return
        switch (response.status) {
          case 401:
            return new Promise((resolve, reject) => {
              if (refreshQueue.length === 0) {
                onRefreshToken(request)
              }
              addRefreshQueue({ request, resolve, reject })
            })
          case 403:
            return new Promise((resolve, reject) => {
              if (refreshQueue.length === 0) {
                onRefreshToken(request)
              }
              addRefreshQueue({ request, resolve, reject })
            })
          default:
            return Promise.resolve(response)
        }
      })
      .then((response) => {
        return resolveContent(response).then((dto) => {
          if (ignore) throw new Error('ignore')
          setData(dto)
          return dto
        })
      })
      .catch((error) => {
        if (ignore) return
        setError(error)
      })
      .finally(() => setLoading(false))
    return [promise, destructor]
  }, [token])
  return { data, loading, error, send }
}