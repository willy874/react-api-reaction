import { useEffect } from 'react'
import { useAuthFetcher } from './useAuthFetcher'

/**
 * @typedef {Object} Todo
 * @property {string} title
 * @property {string} description
 * @property {string} id
 * @property {string} type
 * @property {boolean} status
 * @property {string} createAt
 * @property {string} updateAt
 */

/** @type {() => ({ data: Todo[] | null; loading: boolean; error: Error | null; fetcher: () => [Promise<any>, () => void]})} */
export function useTodo() {
  const { data, loading, error, send } = useAuthFetcher()
  const fetcher = (id) => {
    if (id) return send(`/api/todos/${id}`, { method: 'GET' })
    return send('/api/todos', { method: 'GET' })
  }
  useEffect(() => {
    const [,destructor] = fetcher()
    return destructor
  }, [])
  return { data, loading, error, fetcher }
}