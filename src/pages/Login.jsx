import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTokenContext } from '../contexts'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'

export default function LoginPage () {
  const [searchParams] = useSearchParams()
  const { isLogin, fetchLogin } = useTokenContext()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('password')
  const navigate = useNavigate()
  const onLogin = () => {
    const fullback = searchParams.get('fullback') || '/'
    fetchLogin({ username, password }).then(() => navigate(fullback))
  }
  useEffect(() => {
    if (isLogin) navigate('/', { replace: true })
  }, [isLogin])
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="p-4 border rounded-md w-96">
        <div className="flex items-center justify-center py-4">
          <img src={viteLogo} className="h-12 mx-4" />
          <div className="text-4xl">+</div>
          <img src={reactLogo} className="h-12 mx-4 animate-spin" style={{ animationDuration: '10s' }} />
        </div>
        <div className="py-3">
          <div className="flex mb-4">
            <label className="w-24" htmlFor="username">Username</label>
            <input className="px-2 rounded grow" type="text" id="username" value={username} onInput={(e) => setUsername(e.currentTarget.value)} />
          </div>
          <div className="flex mb-4">
            <label className="inline-block w-24" htmlFor="password">Password</label>
            <input className="px-2 rounded grow"  type="password" id="password" value={password} onInput={(e) => setPassword(e.currentTarget.value)} />
          </div>
        </div>
        <div className="text-center">
          <button className="px-4 py-2 border rounded-lg cursor-pointer border-zinc-500 hover:bg-sky-600" onClick={onLogin}>Login</button>
        </div>
      </div>
    </div>
  )
}