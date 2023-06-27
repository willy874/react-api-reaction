import { useCallback, useRef, useState } from 'react'
import { AuthorizationError } from '../errors'

/** @type {() => {}} */
export const useToken = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const onLogin = useCallback((username, password) => {
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((json) => {
        setToken(json.data)
        localStorage.setItem('token', json.data)
      })
  }, [])
  const onTokenClear = useCallback(() => {
    setToken('')
    localStorage.removeItem('token')
  }, [])
  const onRefreshToken = useCallback(() => {
    fetch('/api/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((json) => {
        setToken(json.data)
        localStorage.setItem('token', json.data)
      })
  }, [token])
  return {
    token,
    onLogin,
    onTokenClear,
    onRefreshToken
  }
}

/**
 * @typedef {Object} Fetcher
 * @property {unknown} data
 * @property {boolean} loading
 * @property {Error | null} error
 * @property {typeof fetch} fetcher
 * @property {() => void} destructor
 */
/** @type {() => Fetcher} */
export function useFetcher() {
  const { token, onLogin, onTokenClear, onRefreshToken } = useToken()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const ignore = useRef(false)
  const request = useRef(null)
  const destructor = useCallback(() => ignore.current = true, [])
  const fetcher = useCallback((url, options) => {
    const { headers, ...rest } = options
    if (!token) {
      return Promise.reject(new Error('token is empty'))
    }
    setLoading(true)
    request.current = new Request(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        ...headers
      },
      ...rest
    })
    fetch(url, request.current)
      .then((res) => {
        switch (res.status) {
          case 401:
            onTokenClear()
            localStorage.removeItem('token')
            return Promise.reject(new AuthorizationError())
          default:
            return res.json()
        }
      })
      .then((res) => {
        if (ignore.current) return
        setData(res)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])
  return { data, loading, error, fetcher, destructor }
}