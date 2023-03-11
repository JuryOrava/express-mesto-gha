const routerUser = require('express').Router()
const { getUser, getUserById, createUser, editProfile, editAvatar } = require('../controllers/users.js')

routerUser.get('/users', getUser)
routerUser.get('/users/:userId', getUserById)
routerUser.post('/users', createUser)
routerUser.patch('/users/me', editProfile)
routerUser.patch('/users/me/avatar', editAvatar)

module.exports = routerUser
