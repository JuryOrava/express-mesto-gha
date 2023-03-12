const routerUser = require('express').Router()
const { getUsers, getUserById, createUser, editProfile, editAvatar } = require('../controllers/users.js')

routerUser.get('/users', getUsers)
routerUser.get('/users/:userId', getUserById)
routerUser.post('/users', createUser)
routerUser.patch('/users/me', editProfile)
routerUser.patch('/users/me/avatar', editAvatar)

module.exports = routerUser
