import { useState, createContext, useContext, useMemo } from 'react'

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
  const value = useMemo(() => {
    const parseState = JSON.parse(state)
    return {
      state: parseState,
      getItem: (key) => {
        return parseState[key]
      },
      setItem: (key, value) => {
        const newState = JSON.stringify({ ...parseState, [key]: value })
        localStorage.setItem('state', newState)
        setState(newState)
      },
      removeItem: (key) => {
        const { [key]: _, ...rest } = parseState
        const newState = JSON.stringify(rest)
        localStorage.setItem('state', newState)
        setState(newState)
      },
    }
  }, [state])
  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
}