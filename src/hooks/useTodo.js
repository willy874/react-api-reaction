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

/**
 * @typedef {Object} UseTodo
 * @property {Todo[] | null} data
 * @property {boolean} loading
 * @property {Error | null} error
 * @property {() => [Promise<any>, () => void]} fetcher
 */

/** @type {(query: Record<string, string>) => UseTodo} */
export function useTodo(query = null) {
  const { data, loading, error, send } = useAuthFetcher()
  const fetcher = () => {
    const queryData = JSON.parse(JSON.stringify(query || {}))
    const isQueryEmpty = Object.keys(queryData).length === 0
    const queryString = new URLSearchParams(queryData)
    return send(`/api/todos${isQueryEmpty ? '' : '?' + queryString}`, { method: 'GET' })
  }
  useEffect(() => {
    const [,destructor] = fetcher()
    return destructor
  }, [query, !!data])
  return { data, loading, error, fetcher }
}

/**
 * @typedef {Object} UseTodoById
 * @property {Todo | null} data
 * @property {boolean} loading
 * @property {Error | null} error
 * @property {() => [Promise<any>, () => void]} fetcher
 */
/** @type {(id: string) => UseTodoById} */
export function useTodoById(id) {
  const { data, loading, error, send } = useAuthFetcher()
  const fetcher = () => {
    return send(`/api/todos/${id}`, { method: 'GET' })
  }
  useEffect(() => {
    const [,destructor] = fetcher()
    return destructor
  }, [])
  return { data, loading, error, fetcher }
}