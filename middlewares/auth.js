const jwt = require('jsonwebtoken');

function handleAuthError(res) { res.status(401).send({ message: 'Необходима авторизация' }); }

function extractBearerToken(header) {
  return header.replace('Bearer ', '');
}

const Auth = function AuthorizationUser(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return handleAuthError(res);
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, 'super-strong-secret');
  } catch (err) {
    return handleAuthError(res);
  }

  req.user = payload;

  next();
};

module.exports = Auth;
