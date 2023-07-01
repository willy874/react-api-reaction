import Path from 'node:path'
import FS from 'node:fs'
import express from 'express'

/** @typedef {import('express').RequestHandler} RequestHandler */

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const root = process.cwd()

const tokenPath = Path.resolve(root, 'data/tokens.json')
const userPath = Path.resolve(root, 'data/users.json')
const todoPath = Path.resolve(root, 'data/todos.json')

/**
 * @typedef {Object} TokenInfo
 * @property {string} username
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {number} expirationAt
 */
/** @type {() => Promise<Record<string, TokenInfo>>} */
const getTokens = () => FS.promises.readFile(tokenPath, 'utf-8').then(JSON.parse).catch(() => ({}))
/** @type {(data: Record<string, TokenInfo>) => Promise<void>} */
const setTokens = (data) => FS.promises.writeFile(tokenPath, JSON.stringify(data))

setTokens({})

/**
 * @typedef {Object} User
 * @property {string} name
 * @property {string} username
 * @property {string} password
 * @property {string} role
 */
/** @type {() => Promise<Record<string, User>>} */
const getUsers = () => FS.promises.readFile(userPath, 'utf-8').then(JSON.parse).catch(() => ({}))

/**
 * @typedef {Object} Todo
 * @property {string} title
 * @property {string} description
 * @property {string} id
 * @property {string} type
 * @property {boolean} status
 * @property {string} createAt
 * @property {string} updateAt
 */
/** @type {() => Promise<Record<string, Todo>>} */
const getTodos = () => FS.promises.readFile(todoPath, 'utf-8').then(JSON.parse)
/** @type {(data: Record<string, Todo>) => Promise<void>} */
const setTodos = (data) => FS.promises.writeFile(todoPath, JSON.stringify(data))

const uuid = () => Math.random().toString(16).slice(2)

/** @type {(username: string) => TokenInfo} */
const createTokenInfo = (username) => {
  const token = uuid()
  return {
    username,
    accessToken: token,
    refreshToken: token,
    // 5 min
    expirationAt: Date.now() + 1000 * 60 * 5
  }
}

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const users = await getUsers()
  const user = users[username]?.password === password ? users[username] : null
  if (!user) {
    res.status(401).send('帳號或密碼錯誤')
    return
  }
  const tokens = await getTokens()
  const info = createTokenInfo(user.username)
  tokens[info.accessToken] = info
  await setTokens(tokens)
  res.send({
    code: 0,
    data: info.accessToken
  })
})

app.post('/logout', async (req, res) => {
  const { authorization } = req.headers
  const tokens = await getTokens()
  delete tokens[authorization]
  await setTokens(tokens)
  res.send({
    code: 0,
  })
})

app.post('/refresh-token', async (req, res) => {
  const { authorization = '' } = req.headers
  const tokens = await getTokens()
  const info = tokens[authorization]
  if (!info) {
    res.status(401).send({
      message: '沒有權限'
    })
    return
  }
  delete tokens[authorization]
  const newInfo = createTokenInfo(info.username)
  tokens[newInfo.accessToken] = newInfo
  await setTokens(tokens)
  res.send({
    code: 0,
    data: newInfo.accessToken
  })
})

/** @type {RequestHandler} */
const AuthorizationMiddleware = async (req, res, next) => {
  const { authorization = '' } = req.headers
  const tokens = await getTokens()
  const users = await getUsers()
  const tokenInfo = tokens[authorization]
  if (!tokenInfo) {
    res.status(403).send({
      message: '沒有權限'
    })
    return
  }
  if (tokenInfo.expirationAt < Date.now()) {
    res.status(401).send({
      message: 'token 過期'
    })
    return
  }
  const user = users[tokenInfo.username]
  if (!user) {
    res.status(401).send({
      message: '沒有該使者'
    })
    return
  }
  next()
}

const getUser = async (req) => {
  const { authorization } = req.headers
  const tokens = await getTokens()
  const users = await getUsers()
  const tokenInfo = tokens[authorization]
  const user = users[tokenInfo.username]
  return user
}

app.get('/user', AuthorizationMiddleware, async (req, res) => {
  const user = await getUser(req)
  res.send({
    code: 0,
    data: user
  })
})

app.get('/todos', AuthorizationMiddleware, async (req, res) => {
  const todos = await getTodos()
  res.send({
    code: 0,
    data: Object.values(todos)
      .filter(todo => todo.status)
      .map(todo => {
        const { id, title, description, status } = todo
        return { id, title, description, status }
      })
  })
})

app.get('/todos/:id', AuthorizationMiddleware, async (req, res) => {
  const { id } = req.params
  const todos = await getTodos()
  const todo = todos[id]
  if (!todo) {
    res.status(404).send({
      message: '找不到資料'
    })
  }
  res.send({
    code: 0,
    data: todo
  })
})

app.post('/todos', AuthorizationMiddleware, async (req, res) => {
  const { title, description, status } = req.body
  const todos = await getTodos()
  const id = uuid()
  const createAt = new Date().toISOString()
  const updateAt = new Date().toISOString()
  const type = 'todo'
  const data = { id, title, description, type, status, createAt, updateAt }
  todos[id] = data
  await setTodos(todos)
  res.send({
    code: 0,
    data
  })
})

app.put('/todos/:id', AuthorizationMiddleware, async (req, res) => {
  const { id } = req.params
  const { title, description, status } = req.body
  const todos = await getTodos()
  const todo = todos[id]
  if (!todo) {
    res.status(404).send({
      message: '找不到資料'
    })
  }
  const updateAt = new Date().toISOString()
  const data = { ...todo, title, description, status, updateAt }
  todos[id] = data
  await setTodos(todos)
  res.send({
    code: 0,
    data
  })
})

app.delete('/todos/:id', AuthorizationMiddleware, async (req, res) => {
  const { id } = req.params
  const todos = await getTodos()
  delete todos[id]
  await setTodos(todos)
  res.send({
    code: 0,
  })
})

app.listen(3100, () => {
  console.log('app start at http://localhost:3100')
})