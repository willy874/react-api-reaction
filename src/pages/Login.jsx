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
    fetchLogin({ username, password }).then(() => {
      navigate('/')
    })
  }
  useEffect(() => {
    const fullback = searchParams.get('fullback') || '/'
    if (isLogin) navigate(fullback, { replace: true })
  }, [isLogin])
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-96 border rounded-md p-4">
        <div className="flex justify-center items-center py-4">
          <img src={viteLogo} className="h-12 mx-4" />
          <div className="text-4xl">+</div>
          <img src={reactLogo} className="h-12 animate-spin mx-4" style={{ animationDuration: '10s' }} />
        </div>
        <div className="py-3">
          <div className="mb-4 flex">
            <label className="w-24" htmlFor="username">Username</label>
            <input className="grow rounded px-2" type="text" id="username" value={username} onInput={(e) => setUsername(e.target.value)} />
          </div>
          <div className="mb-4 flex">
            <label className="inline-block w-24" htmlFor="password">Password</label>
            <input className="grow rounded px-2"  type="password" id="password" value={password} onInput={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <div className="text-center">
          <button onClick={onLogin}>Login</button>
        </div>
      </div>
    </div>
  )
}