const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/not-found-err'); // 404
const BadRequesrError = require('../errors/bad-request-err'); // 400
const ClientError = require('../errors/client-err'); // 401
const ConflictingRequestError = require('../errors/conflicting-request-err'); // 409

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
      name: req.body.name,
      about: req.body.about,
      avatar: req.body.avatar,
    }))
    .then((user) => {
      res.status(201).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
        _id: user._id,
      });
    })
    .catch((err) => {
      if (err.name === 'MongoServerError') {
        throw new ConflictingRequestError('Пользователь с таким Email уже существует!');
      } else if (err.name === 'ValidationError') {
        throw new ClientError(`Введен некорректный логин или пароль. ${err.name}`);
      }
    })
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user == null) {
        next(new NotFoundError(`Пользователь с указанным _id:${req.params.userId} не найден.`));
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequesrError('Переданы некорректные данные при запросе пользователя.');
      }
    })
    .catch(next);
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports.getUserInfo = (req, res) => {
  User.findOne({ name: 'horhe' })
    .then((user) => {
      res.status(200).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
        _id: user._id,
      });
    })
    .catch(() => {
      res.status(404).send({ message: 'Запрашиваемая страница не найдена', test: `${req}, ${req.user._id}` });
    });
};

module.exports.editProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequesrError('Переданы некорректные данные при обновлении профиля.');
      }
    })
    .catch(next);
};

module.exports.editAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequesrError('Переданы некорректные данные при обновлении профиля.');
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.send({ token }); // записывать JWT в httpOnly куку!
      console.log();
    })
    .catch((err) => {
      if (err.name === 'Error') {
        throw new ClientError('Введен некорректный логин или пароль.'); // ПРОВЕРИТЬ ОШИБКУ
      }
    })
    .catch(next);
};
