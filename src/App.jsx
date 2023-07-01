import { RouterProvider } from "react-router-dom";
import { StorageContextProvider, TokenContextProvider } from './contexts'
import { router } from './router'
import './App.css'

function App() {
  return (
    <StorageContextProvider>
      <TokenContextProvider>
        <RouterProvider router={router} />
      </TokenContextProvider>
    </StorageContextProvider>
  )
}

export default App
