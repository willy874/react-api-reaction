import { useCallback, useMemo, useRef, useState } from 'react'
import { AuthorizationError } from '../errors'
import { useTokenContext } from '../contexts'
import { Fetcher } from '../utils'

/**
 * @typedef {Object} Fetcher
 * @property {unknown} data
 * @property {boolean} loading
 * @property {Error | null} error
 * @property {typeof fetch} fetcher
 * @property {() => void} destructor
 */
/** @type {() => Fetcher} */
export function useAuthFetcher() {
  const { token, addRefreshQueue, onRefreshToken } = useTokenContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  let ignore = false
  const destructor = () => (ignore = true)
  const send = useCallback((url, { headers, ...options }) => {
    setLoading(true)
    const $headers = new Headers(headers)
    $headers.set('Content-Type', 'application/json')
    $headers.set('Authorization', token)
    const fetcher = new Fetcher({
      ...options,
      url,
      headers: $headers,
    })
    fetcher
      .send()
      .then(([request, response]) => {
        switch (res.status) {
          case 401:
            return new Promise((resolve, reject) => {
              addRefreshQueue({ request, resolve, reject })
              onRefreshToken()
            })
          default:
            return response.json()
        }
      })
      .then((res) => {
        if (ignore) return
        setData(res)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [fetcher])
  return { data, loading, error, send, destructor }
}