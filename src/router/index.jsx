import { Suspense, lazy, createElement } from 'react'
import { createBrowserRouter } from "react-router-dom";
import Spin from "../components/Spin";

const PageSuspense = ({ loader, fallback = <Spin /> }) => {
  return (
    <Suspense fallback={fallback}>
      {createElement(lazy(loader))}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PageSuspense loader={() => import('../router/Layout.jsx')} />
    ),
    children: [
      {
        path: "welcome",
        element: (
          <PageSuspense loader={() => import('../pages/Welcome.jsx')} />
        ),
      },
      {
        path: "todo",
        element: (
          <PageSuspense loader={() => import('../pages/Todo.jsx')} />
        ),
        children: [
          {
            path: "",
            element: (
              <PageSuspense loader={() => import('../pages/TodoList.jsx')} />
            ),
          },
          {
            path: "edit/add",
            element: (
              <PageSuspense loader={() => import('../pages/TodoAdd.jsx')} />
            ),
          },
          {
            path: "edit/:id",
            element: (
              <PageSuspense loader={() => import('../pages/TodoEdit.jsx')} />
            ),
          }
        ],
      }
    ]
  },
  {
    path: "/login",
    element: (
      <PageSuspense loader={() => import('../pages/Login.jsx')} />
    ),
  }
]);