import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTokenContext } from '../contexts'
import { useUser } from '../hooks'

function Aside() {
  return <aside></aside>;
}

function Header() {
  const { fetchLogout } = useTokenContext()
  const onLogout = () => fetchLogout()
  return (
    <header className="flex">
      <div className="grow"></div>
      <div className="px-4 py-2">
        <button className="border rounded-lg py-2 px-4 border-zinc-500 cursor-pointer hover:bg-sky-600" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}

export default function Layout() {
  const { isLogin } = useTokenContext()
  const navigate = useNavigate()
  const location = useLocation()
  const { data } = useUser()
  useEffect(() => {
    if (isLogin) {
      if (location.pathname === '/') {
        navigate('/welcome', { replace: true })
      }
    } else {
      navigate(`/login?${new URLSearchParams({ fullback: location.pathname })}`, { replace: true })
    }
  }, [isLogin])
  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex grow">
        <Aside />
        <div className="grow">
          <Outlet context={data} />
        </div>
      </div>
    </div>
  );
}