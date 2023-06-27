import { useEffect } from 'react'
import { useFetcher } from './useFetcher'

/**
 * @typedef {Object} User
 * @property {string} name
 * @property {string} username
 * @property {string} password
 * @property {string} role
 * @property {string} token
 */

/** @type {() => ({ data: User | null; loading: boolean; error: Error | null })} */
export function useUser() {
  const { data, loading, error, fetcher, destructor } = useFetcher()
  useEffect(() => {
    fetcher('/api/user', { method: 'GET' })
    return destructor
  }, [])
  return { data, loading, error }
}