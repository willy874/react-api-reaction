import classnames from 'classnames'
import { TodoContextProvider } from '../contexts'
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function TodoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const btnCls = 'border rounded-lg py-2 px-4'
  const defaultCls = 'border-zinc-500 hover:bg-sky-600'
  const activeCls = 'border-white cursor-auto'
  return (
    <div className="p-4">
      <h2 className="mb-4 text-3xl font-bold">Todo List</h2>
      <div className="flex -mx-2">
        <div className="px-2">
          <button
            className={classnames(btnCls, [
              location.pathname === '/todo' ? activeCls : defaultCls,
            ])}
            onClick={() => navigate('/todo')}>List</button>
        </div>
        <div className="px-2">
          <button
            className={classnames(btnCls, [
              location.pathname.includes('/todo/edit') ? activeCls : defaultCls,
            ])}
            onClick={() => navigate('/todo/edit/add')}>Edit</button>
        </div>
      </div>
      <div className="py-3">
        <TodoContextProvider>
          <Outlet />
        </TodoContextProvider>
      </div>
    </div>
  )
}