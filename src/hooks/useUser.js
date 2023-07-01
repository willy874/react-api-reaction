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
    return send('/api/user', { method: 'GET' })[1]
  }, [])
  return { data, loading, error }
}