import { useState, createContext, useContext, useMemo, useCallback } from 'react'
import { useAuthFetcher } from '../hooks/useAuthFetcher'
/** @typedef {import('../hooks/useTodo').Todo} Todo */

const defaultTodoContext = {
  /** @type {Todo[]} */
  todos: [],
  /** @type {React.Dispatch<React.SetStateAction<Todo[]>>} */
  setTodos: () => {},
  /** @type {(todo: Todo) => Promise<void>}*/
  addTodo: () => {},
  /** @type {(todo: Todo) => Promise<void>}*/
  editTodo: () => {},
  /** @type {(id: string) => Promise<void>}*/
  deleteTodo: () => {},
}

const TodoContext = createContext(defaultTodoContext)

export const useTodoContext = () => useContext(TodoContext)

export function TodoContextProvider({ children }) {
  const [todos, setTodos] = useState([])
  const { send } = useAuthFetcher()
  const addTodo = useCallback((todo) => {
    return send('/api/todos', { method: 'POST', body: JSON.stringify(todo) })[0]
  }, [])
  const editTodo = useCallback((todo) => {
    return send('/api/todos', { method: 'PUT', body: JSON.stringify(todo) })[0]
  }, [])
  const deleteTodo = useCallback((id) => {
    return send(`/api/todos/${id}`, { method: 'DELETE' })[0]
  }, [])

  /** @type {typeof defaultTodoContext} */
  const value = useMemo(() => ({
    todos,
    setTodos,
    addTodo,
    editTodo,
    deleteTodo,
  }), [todos])
  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}