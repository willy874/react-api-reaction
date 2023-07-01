import { useCallback, useState, createContext, useContext, useMemo } from 'react'
import { useStorageContext } from './storageContext'

/**
 * @typedef {Object} RefreshRequest
 * @property {Request} request
 * @property {Function} resolve
 * @property {Function} reject
 */

const defaultTokenContext = {
  token: '',
  isLogin: false,
  /** @type {React.Dispatch<React.SetStateAction<string>>} */
  setToken: () => {},
  /** @type {(params: { username: string; password: string; }) => Promise<void>} */
  fetchLogin: () => {},
  /** @type {() => Promise<void>} */
  fetchLogout: () => {},
  /** @type {() => Promise<string>} */
  onRefreshToken: () => {},
  /** @type {RefreshRequest[]} */
  refreshQueue: [],
  /** @type {(req: Request) => void} */
  addRefreshQueue: () => {}
}

const TokenContext = createContext(defaultTokenContext)

export const useTokenContext = () => useContext(TokenContext)

export function TokenContextProvider({ children }) {
  const storage = useStorageContext()
  /** @type {string} */
  const token = storage.getItem('token') || ''
  /** @type {[RefreshRequest[]]} */
  const [refreshQueue] = useState([])
  const addRefreshQueue = useCallback((request) => {
    refreshQueue.push(request)
  }, [])
  const fetchLogin = useCallback(({ username, password }) => {
    return fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((json) => {
        storage.setItem('token', json.data)
      })
  }, [])
  const fetchLogout = useCallback(() => {
    return fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((json) => {
        storage.removeItem('token')
        return json
      })
  }, [])
  const onRefreshToken = useCallback((req) => {
    const fetchRefreshToken = (retry = 0) => {
      storage.removeItem('token')
      fetch('/api/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
      })
        .then((res) => res.json())
        .then((json) => {
          storage.setItem('token', json.data)
          req.headers.set('Authorization', json.data)
          return Promise.all(
            refreshQueue.map(({ request, resolve, reject }) => {
              return fetch(request).then(resolve).catch(reject)
            })
          )
        })
        .then(() => {
          if (retry) fetchRefreshToken(retry - 1)
        })
    }
    fetchRefreshToken()
  }, [token])
  /** @type {typeof defaultTokenContext} */
  const value = useMemo(() => ({
    token,
    isLogin: !!token,
    fetchLogin,
    fetchLogout,
    onRefreshToken,
    addRefreshQueue
  }), [token, onRefreshToken])
  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
}