import { useCallback, useState, createContext, useContext, useMemo, useState } from 'react'

const defaultStorageContext = {
  /** @type {Record<string, any>} */
  state: {},
  /** @type {(key: string) => any} */
  getItem: () => {},
  /** @type {(key: string, value: any) => void} */
  setItem: () => {},
  /** @type {(key: string) => void} */
  removeItem: () => {},
}

const StorageContext = createContext(defaultStorageContext)

export const useStorageContext = () => useContext(StorageContext)

export function StorageContextProvider({ children }) {
  const [state, setState] = useState(localStorage.getItem('state') || '{}')
  /** @type {typeof defaultStorageContext} */
  const value = useMemo(() => ({
    state: JSON.parse(state),
    getItem: (key) => {
      return JSON.parse(state)[key]
    },
    setItem: (key, value) => {
      const newState = JSON.stringify({ ...state, [key]: value })
      localStorage.setItem('state', newState)
      setState(newState)
    },
    removeItem: (key) => {
      const { [key]: _, ...rest } = JSON.parse(state)
      const newState = JSON.stringify(rest)
      localStorage.setItem('state', newState)
      setState(newState)
    },
  }), [state])
  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
}