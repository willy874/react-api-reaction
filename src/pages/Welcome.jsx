import { useNavigate } from "react-router-dom";
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'

export default function WelcomePage() {
  const navigate = useNavigate()
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div>
        <div className="flex justify-center items-center py-4">
          <a href="https://vitejs.dev" target="_blank">
            <img src={viteLogo} className="h-24 mx-4" alt="Vite logo" />
          </a>
          <div className="text-4xl">+</div>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="h-24 animate-spin mx-4" alt="React logo" style={{ animationDuration: '10s' }} />
          </a>
        </div>
        <div className="text-center">
          <h1>Vite + React</h1>
          <div>
            <p>
              Edit <code>src/App.jsx</code> and save to test HMR
            </p>
          </div>
          <p>
            Click on the Vite and React logos to learn more
          </p>
          <div className="py-4">
            <button className="border rounded-lg py-2 px-4 border-zinc-500 cursor-pointer hover:bg-sky-600" onClick={() => navigate('/todo')}>Todo Start</button>
          </div>
        </div>
      </div>
    </div>
  )
}
