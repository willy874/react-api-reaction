import { useState, useRef } from 'react'
import { useNavigate } from "react-router-dom";
import { useTodoContext } from '../contexts'
import TodoEditor from '../components/TodoEditor'
/** @typedef {import('../components/TodoEditor').TodoEditorRef} TodoEditorRef */

export default function TodoAddPage() {
  /** @type {React.MutableRefObject<TodoEditorRef>} */
  const formRef = useRef()
  const [form, setForm] = useState({ title: '', description: '', status: true })
  const { addTodo } = useTodoContext()
  const navigate = useNavigate()
  const onSubmit = (e) => {
    e.preventDefault()
    if (formRef.current?.validation()) {
      addTodo(form)
        .then(() => navigate('/todo'))
    }
  }
  return (
    <div className="flex justify-center py-4">
      <div className="w-5/6">
        <h2 className="mb-4 text-2xl">Create New Todo</h2>
        <form className="w-full" onSubmit={onSubmit}>
          <TodoEditor ref={formRef} value={form} onChange={setForm} />
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