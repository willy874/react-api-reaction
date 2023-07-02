import { useEffect, useMemo, useState, useImperativeHandle, forwardRef, useRef, useCallback } from 'react'
/** @typedef {import('../hooks/useTodo').Todo} Todo */

/**
 * @typedef {Object} TodoEditorProps
 * @property {Todo} todo
 * @property {(value: Todo) => void} onChange
 */
/**
 * @typedef {Object} TodoEditorRef
 * @property {HTMLFormElement} el
 * @property {() => void} reset
 * @property {() => boolean} validation
 */

const vaildators = {
  title: (value) => {
    if (value === '') {
      return 'Title is required.'
    }
    if (value.length > 10) {
      return 'Title must be less than 10 characters.'
    }
  },
  description: (value) => {
    if (value === '') {
      return 'Description is required.'
    }
  }
}


/** @type {(props: TodoEditorProps, React.Ref<TodoEditorRef>) => React.ReactNode} */
function TodoEditor({ value, onChange = () => {} }, ref) {
  const formRef = useRef()
  const [title, setTitle] = useState(value.title || '')
  const [description, setDescription] = useState(value.description || '')
  const [status, setStatus] = useState(value.status === false ? false : true)
  /** @type {[Partial<Record<keyof Todo, string>>]} */
  const [errorMessage, setErrorMessage] = useState({})
  const form = useMemo(() => ({ title, description, status }), [title, description, status])
  const validation = useCallback(() => {
    const errors = {}
    for (const key in vaildators) {
      const validator = vaildators[key]
      const error = validator(form[key])
      if (error) {
        errors[key] = error
      }
    }
    setErrorMessage(errors)
    return Object.keys(errors).length === 0
  }, [form])
  const reset = useCallback(() => {
    setTitle('')
    setDescription('')
    setStatus(true)
    setErrorMessage({})
  }, [])
  useEffect(() => {
    onChange(form)
  }, [form])
  useImperativeHandle(ref, () => ({
    el: formRef.current,
    validation,
    reset,
  }), [form, validation, reset])
  return (
    <div ref={formRef} className="mb-3">
      <div className="flex mb-2">
        <label className="w-24" htmlFor="title">Title</label>
        <div className="relative pb-6 grow">
          <input className="w-full px-4 py-1 rounded" type="text" id="title" value={title} onInput={(e) => setTitle(e.currentTarget.value)} />
          {errorMessage.title && <div className="absolute bottom-0 left-0 text-red-500">{errorMessage.title}</div>}
        </div>
      </div>
      <div className="flex mb-2">
        <label className="w-24" htmlFor="description">Description</label>
        <div className="relative pb-6 grow">
          <input className="w-full px-4 py-1 rounded" id="description" type="text" value={description} onInput={(e) => setDescription(e.currentTarget.value)} />
          {errorMessage.description && <div className="absolute bottom-0 left-0 text-red-500">{errorMessage.description}</div>}
        </div>
      </div>
      <div className="flex items-center">
        <div className="w-24">Status</div>
        <div className="px-1">
          <label className="px-1" htmlFor="public">Public</label>
          <input type="radio" id="public" checked={status} onChange={() => setStatus(true)} />
        </div>
        <div className="px-1">
          <label className="px-1" htmlFor="private">Private</label>
          <input type="radio" id="private" checked={!status} onChange={() => setStatus(false)}/>
        </div>
      </div>
    </div>
  )
}

export default forwardRef(TodoEditor)