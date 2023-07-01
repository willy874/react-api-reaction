import { useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { useTodo } from '../hooks'
import { useTodoContext } from '../contexts'
import Spin from "../components/Spin";

export default function TodoListPage() {
  const { setTodos, deleteTodo } = useTodoContext()
  const { data, fetcher } = useTodo()
  const navigate = useNavigate()
  const onEdit = (id) => {
    navigate(`/todo/edit/${id}`)
  }
  const onDelete = (id) => {
    deleteTodo(id).then(() => fetcher())
  }
  useEffect(() => {
    setTodos(data)
  }, [setTodos])
  if (!data) {
    return <Spin />
  }
  return (
    <div>
      <ul>
        {data.map((todo, index) => (
          <li className="flex items-center px-6 py-2 my-4 text-lg border rounded-lg border-zinc-700" title={todo.description} key={todo.id}>
            <div className="pr-3">{index + 1}.</div>
            <div className="w-0 overflow-hidden grow whitespace-nowrap overflow-ellipsis">{todo.title}</div>
            <button className="px-2 mx-1 rounded hover:bg-zinc-500" onClick={() => onEdit(todo.id)}>EDIT</button>
            <button className="px-2 mx-1 rounded hover:bg-zinc-500" onClick={() => onDelete(todo.id)}>DELETE</button>
          </li>
        ))}
      </ul>
    </div>
  )
}