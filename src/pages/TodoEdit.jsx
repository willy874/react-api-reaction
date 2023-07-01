import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { useTodoContext } from '../contexts'
import { useTodo } from '../hooks'
import TodoEditor from '../components/TodoEditor'
/** @typedef {import('../components/TodoEditor').TodoEditorRef} TodoEditorRef */

export default function TodoEditPage() {
  /** @type {React.MutableRefObject<TodoEditorRef>} */
  const formRef = useRef()
  const { id = '' } = useParams()
  const [form, setForm] = useState(null)
  const { editTodo } = useTodoContext()
  const navigate = useNavigate()
  const { data ,fetcher } = useTodo()
  const onSubmit = (e) => {
    e.preventDefault()
    if (formRef.current?.validation()) {
      editTodo(form)
        .then(() => navigate('/todo'))
    }
  }
  useEffect(() => {
    if (id) {
      const [promise, destructor] = fetcher(id)
      promise.then((response) => {
        if (response) {
          const { title, description, status } = response.data
          setForm({ title, description, status })
        }
      })
      return destructor
    }
  }, [id])
  return (
    <div className="flex justify-center py-4">
      <div className="w-5/6">
        <h2 className="mb-4 text-2xl">Edit Todo</h2>
        <form className="w-full" onSubmit={onSubmit}>
          {form && <TodoEditor ref={formRef} value={form} onChange={setForm} />}
          <div className="flex gap-2">
            <div className="grow"></div>
            <button className="px-4 py-2 border rounded-lg cursor-pointer border-zinc-500 hover:bg-sky-600" type="button" onClick={() => formRef.current?.reset()}>Reset</button>
            <button className="px-4 py-2 border rounded-lg cursor-pointer border-zinc-500 hover:bg-sky-600">Submit</button>
          </div>
        </form>
      </div>
    </div>
  )
}