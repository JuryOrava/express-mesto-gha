const jwt = require('jsonwebtoken');
const ClientError = require('../errors/client-err');

const handleAuthError = (res, next) => {
  next(new ClientError('Необходима авторизация'));
};

// eslint-disable-next-line arrow-body-style
const extractBearerToken = (header) => {
  return header.replace('Bearer ', '');
};

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return handleAuthError(res, next);
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    return handleAuthError(res, next);
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
