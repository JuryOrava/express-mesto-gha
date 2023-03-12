const User = require('../models/user')
const { writeTextToFile } = require('./server-err-logs/error-logs')

const date = Date.now();
const serverErrorFile = `./controllers/server-err-logs/log-${date}.txt`

const ERROR_CODE = 404;
const CAST_ERROR_CODE = 400;
const SERVER_ERROR_CODE = 500;

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body

  User.create({ name, about, avatar })
    .then(user => res.send({ data: user }))
    .catch(err => {
      if (err.name == 'ValidationError') {
        res.status(CAST_ERROR_CODE).send({ message: `Переданы некорректные данные при создании пользователя.` })
      } else {
        res.send({ message: `Сервер не доступен.` })
        writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`)
      }
    })
}
module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
  .then((user) => {
    if (user == null) {
      return res.status(ERROR_CODE).send({ message: `Пользователь с указанным _id:${req.user._id} не найден.` })
    }
    res.send({ data: user })
  })
  .catch(err => {
    if (err.name == 'CastError') {
      res.status(CAST_ERROR_CODE).send({ message: `Запрашиваемый пользователь не найден.` })
    } else {
      writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`)
    }
  })
}
module.exports.getUsers = (req, res) => {
  User.find({})
    .then(user => res.send({ data: user }))
    .catch(err => {
      if (err.name == 'CastError') {
        res.status(CAST_ERROR_CODE).send({ message: `Что-то пошло не так.` })
      } else {
        writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`)
      }
    })
}

module.exports.editProfile = (req, res) => {
  const { name, about } = req.body
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
        new: true,
        runValidators: true
    }
  )
  .then(user => res.send({ data: user }))
  .catch(err => {
    if (err.name == 'CastError') {
      res.status(CAST_ERROR_CODE).send({ message: `Переданы некорректные данные при обновлении профиля.` })
    } else {
      writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`)
    }
  })
}

module.exports.editAvatar = (req, res) => {
  const { avatar } = req.body
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
        new: true,
        runValidators: true
    }
  )
  .then(user => res.send({ data: user }))
  .catch(err => {
    if (err.name == 'CastError') {
      res.status(CAST_ERROR_CODE).send({ message: `Переданы некорректные данные при обновлении профиля.` })
    } else {
      writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`)
    }
  })
}
