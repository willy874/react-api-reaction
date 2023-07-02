import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from "react-router-dom";
import classnames from "classnames";
import { useTodo } from '../hooks'
import { useTodoContext } from '../contexts'
import Spin from "../components/Spin";

const DEFAULT_PAGE = '1'
const DEFAULT_PAGE_SIZE = '10'
const DEFAULT_SORT = 'createAt'
const DEFAULT_SEARCH_KEYWORD = ''

export default function TodoListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setPage] = useState(searchParams.get('page') || DEFAULT_PAGE)
  const [pageSize, setPageSize] = useState(searchParams.get('page_size') || DEFAULT_PAGE_SIZE)
  const [sort, setSort] = useState(searchParams.get('sort') || DEFAULT_SORT)
  const [search, setSearch] = useState(searchParams.get('search') || DEFAULT_SEARCH_KEYWORD)
  const searchData = useMemo(() => ({
    page: currentPage === DEFAULT_PAGE ? undefined : currentPage,
    page_size: pageSize === DEFAULT_PAGE_SIZE ? undefined : pageSize,
    sort: sort === DEFAULT_SORT ? undefined : sort,
    search: search === DEFAULT_SEARCH_KEYWORD ? undefined : search,
  }), [currentPage, pageSize, sort, search])
  const { setTodos, deleteTodo } = useTodoContext()
  const navigate = useNavigate()

  const { data, fetcher } = useTodo(searchData)
  useEffect(() => {
    setSearchParams(new URLSearchParams(JSON.parse(JSON.stringify(searchData))))
  }, [searchData])
  useEffect(() => {
    setTodos(data)
  }, [])

  const onEdit = (id) => {
    navigate(`/todo/edit/${id}`)
  }
  const onDelete = (id) => {
    deleteTodo(id).then(() => fetcher())
  }
  if (!data) {
    return <Spin />
  }

  const perPage = Math.ceil(data.total / data.pageSize)
  
  return (
    <div>
      <div className="flex -mx-2">
        <div className="flex px-2">
          <div className="pr-2">搜尋</div>
          <input value={search} onInput={(e) => setSearch(e.currentTarget.value)} type="text" />
        </div>
        <div className="flex px-2">
          <div className="pr-2">排序</div>
          <select value={sort} onChange={(e) => setSort(e.currentTarget.value)}>
            <option value="title">Title</option>
            <option value="description">Description</option>
            <option value="createAt">Create Time</option>
            <option value="updateAt">Update Time</option>
          </select>
        </div>
      </div>
      <ul>
        {data.data.map((todo, index) => (
          <li className="flex items-center px-6 py-2 my-4 text-lg border rounded-lg border-zinc-700" title={todo.description} key={todo.id}>
            <div className="pr-3">{index + 1}.</div>
            <div className="w-0 overflow-hidden grow whitespace-nowrap overflow-ellipsis">{todo.title}</div>
            <button className="px-2 mx-1 rounded hover:bg-zinc-500" onClick={() => onEdit(todo.id)}>EDIT</button>
            <button className="px-2 mx-1 rounded hover:bg-zinc-500" onClick={() => onDelete(todo.id)}>DELETE</button>
          </li>
        ))}
      </ul>
      <div className="flex">
        <div className="grow"></div>
        <ul className="flex">
          {new Array(perPage).fill(0).map((_, index) => (index + 1)).map((page) => (
            <li key={page}><button className={classnames({
              'px-2 mx-1 rounded hover:bg-zinc-500': true,
              'bg-zinc-500': page === Number(currentPage),
            })} onClick={() => setPage(String(page))}>{page}</button></li>
          ))}
        </ul>
        <select value={String(pageSize)} onChange={(e) => setPageSize(e.currentTarget.value)}>
          <option value="10">10筆</option>
          <option value="20">20筆</option>
          <option value="50">50筆</option>
        </select>
      </div>
    </div>
  )
}