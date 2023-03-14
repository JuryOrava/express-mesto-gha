const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { writeTextToFile } = require('../errors/server-err-logs/error-logs');

const NotFoundError = require('../errors/not-found-err'); // 404
const BadRequesrError = require('../errors/bad-request-err'); // 400
const ClientError = require('../errors/client-err'); // 401
const ConflictingRequestError = require('../errors/conflicting-request-err'); // 409
const InternalServerError = require('../errors/internal-server-err'); // 500

const date = Date.now();
const serverErrorFile = `../errors/server-err-logs/log-${date}.txt`;

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
    }))
    .then((user) => {
      res.status(201).send({
        _id: user._id,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.name === 'MongoServerError') {
        throw new ConflictingRequestError('Пользователь с таким Email уже существует!');
      } else if (err.name === 'ValidationError') {
        throw new ClientError(`Введен некорректный логин или пароль. ${err.name}`);
      } else {
        writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`);
        throw new InternalServerError('На сервере произошла ошибка.');
      }
    })
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user == null) {
        throw new NotFoundError(`Пользователь с указанным _id:${req.user._id} не найден.`);
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequesrError('Переданы некорректные данные при запросе пользователя.');
      } else {
        writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`);
        throw new InternalServerError('На сервере произошла ошибка.');
      }
    })
    .catch(next);
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`);
      throw new InternalServerError('На сервере произошла ошибка.');
    })
    .catch(next);
};

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`);
      throw new InternalServerError('На сервере произошла ошибка.');
    })
    .catch(next);
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
      } else {
        writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`);
        throw new InternalServerError('На сервере произошла ошибка.');
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
      } else {
        writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`);
        throw new InternalServerError('На сервере произошла ошибка.');
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
    })
    .catch((err) => {
      if (err.name === 'Error') {
        throw new ClientError('Введен некорректный логин или пароль.'); // ПРОВЕРИТЬ ОШИБКУ
      } else {
        writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()};
        Текст ошибки: ${err.message}`);
        throw new InternalServerError('На сервере произошла ошибка.');
      }
    })
    .catch(next);
};
