import { useCallback, useState, createContext, useContext, useMemo, useState } from 'react'
import { useStorageContext } from './storageContext'

/**
 * @typedef {Object} RefreshRequest
 * @property {Request} request
 * @property {Function} resolve
 * @property {Function} reject
 */

const defaultTokenContext = {
  token: '',
  /** @type {React.Dispatch<React.SetStateAction<string>>} */
  setToken: () => {},
  /** @type {(params: { username: string; password: string; }) => Promise<void>} */
  onLogin: () => {},
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
  const onLogin = useCallback((username, password) => {
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((json) => {
        setToken(json.data)
        storage.setItem('token', json.data)
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
  const value = useMemo(() => ({ token, onLogin, onRefreshToken, addRefreshQueue }), [token, onRefreshToken])
  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
}