const User = require('../models/user')

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body

  User.create({ name, about, avatar })
    .then(user => res.send({ data: user }))
    .then(user => console.log(user))
    // eslint-disable-next-line no-unused-vars
    .catch(err => res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя' }))
    .catch(err => res.status(500).send({ message: err.message }))
}
module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then(user => res.send({ data: user }))
    // eslint-disable-next-line no-unused-vars
    .catch(err => res.status(404).send({ message: "Запрашиваемый пользователь не найден" }))
    .catch(err => res.status(500).send({ message: err.message }))
}
module.exports.getUser = (req, res) => {
  User.find({})
    .then(user => res.send({ data: user }))
    // eslint-disable-next-line no-unused-vars
    .catch(err => res.status(500).send({ message: err.message }))
}

module.exports.editProfile = (req, res) => {
  const { name, about } = req.body
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    // Передадим объект опций:
    {
        new: true, // обработчик then получит на вход обновлённую запись
        runValidators: true, // данные будут валидированы перед изменением
        upsert: true // если пользователь не найден, он будет создан
    }
  )
  .then(user => res.send({ data: user }))
    // eslint-disable-next-line no-unused-vars
    .catch(err => res.status(400).send({ message: "Переданы некорректные данные при обновлении профиля." }))
    // eslint-disable-next-line no-unused-vars
    .catch(err => res.status(404).send({ message: `Пользователь с указанным _id:${req.user._id} не найден.` }))
    .catch(err => res.status(500).send({ message: err.message }))
}

module.exports.editAvatar = (req, res) => {
  const { avatar } = req.body
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    // Передадим объект опций:
    {
        new: true, // обработчик then получит на вход обновлённую запись
        runValidators: true, // данные будут валидированы перед изменением
        upsert: true // если пользователь не найден, он будет создан
    }
  )
  .then(user => res.send({ data: user }))
    // eslint-disable-next-line no-unused-vars
    .catch(err => res.status(400).send({ message: "Переданы некорректные данные при обновлении профиля." }))
    // eslint-disable-next-line no-unused-vars
    .catch(err => res.status(404).send({ message: `Пользователь с указанным _id:${req.user._id} не найден.` }))
    .catch(err => res.status(500).send({ message: err.message }))
}
