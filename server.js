// const Path = require('node:path')
// const FS = require('node:fs')
// const express = require('express')
import Path from 'node:path'
import FS from 'node:fs'
import express from 'express'

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const root = process.cwd()

const tokenPath = Path.resolve(root, 'data/tokens.json')
const userPath = Path.resolve(root, 'data/users.json')
const prodPath = Path.resolve(root, 'data/prods.json')

/** @type {() => Promise<Record<string, string>>} */
const getTokens = () => FS.promises.readFile(tokenPath, 'utf-8').then(JSON.parse)
/** @type {(data: Record<string, string>) => Promise<void>} */
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
const getUsers = () => FS.promises.readFile(userPath, 'utf-8').then(JSON.parse)

/**
 * @typedef {Object} Prod
 * @property {string} name
 * @property {string} price
 * @property {string} img
 * @property {string} desc
 * @property {string} id
 * @property {string} type
 * @property {boolean} status
 * @property {string} createAt
 * @property {string} updateAt
 */
/** @type {() => Promise<Record<string, Prod>>} */
const getProds = () => FS.promises.readFile(prodPath, 'utf-8').then(JSON.parse)
/** @type {(data: Record<string, Prod>) => Promise<void>} */
const setProds = (data) => FS.promises.writeFile(prodPath, JSON.stringify(data))

const uuid = () => Math.random().toString(16).slice(2)

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const users = await getUsers()
  const user = users[username]?.password === password ? users[username] : null
  if (!user) {
    res.status(401).send('帳號或密碼錯誤')
    return
  }
  const tokens = await getTokens()
  const token = uuid()
  tokens[token] = user.username
  await setTokens(tokens)
  res.send({
    code: 0,
    data: token
  })
})

app.get('/logout', async (req, res) => {
  const { authorization } = req.headers
  const tokens = await getTokens()
  delete tokens[authorization]
  await setTokens(tokens)
  res.send({
    code: 0,
  })
})

const isAuthenticated = async (req) => {
  const { authorization } = req.headers
  const tokens = await getTokens()
  const users = await getUsers()
  const username = tokens[authorization]
  const user = users[username]
  return user
}

app.get('/user', async (req, res) => {
  const user = await isAuthenticated(req)
  if (!user) {
    res.status(401).send('沒有權限')
    return
  }
  res.send({
    code: 0,
    data: user
  })
})

app.get('/prods', async (req, res) => {
  const user = await isAuthenticated(req)
  if (!user) {
    res.status(401).send('沒有權限')
    return
  }
  const prods = await getProds()
  res.send({
    code: 0,
    data: Object.values(prods)
      .filter(prod => prod.status)
      .map(prod => {
        const { id, name, price, img, desc, type } = prod
        return { id, name, price, img, desc, type }
      })
  })
})

app.post('/prods', async (req, res) => {
  const user = await isAuthenticated(req)
  if (!user) {
    res.status(401).send('沒有權限')
    return
  }
  const { name, price, img, desc, type } = req.body
  const prods = await getProds()
  const id = uuid()
  const createAt = new Date().toISOString()
  const updateAt = new Date().toISOString()
  const status = true
  const data = { id, name, price, img, desc, type, status, createAt, updateAt }
  await setProds(prods[id] = data)
  res.send({
    code: 0,
    data
  })
})

app.listen(3100, () => {
  console.log('app start at http://localhost:3100')
})