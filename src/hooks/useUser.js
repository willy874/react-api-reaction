import { useEffect } from 'react'
import { useAuthFetcher } from './useAuthFetcher'

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
  const { data, loading, error, send } = useAuthFetcher()
  useEffect(() => {
    const { destructor } = send('/api/user', { method: 'GET' })
    return destructor
  }, [])
  return { data, loading, error }
}