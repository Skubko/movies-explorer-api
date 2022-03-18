require('dotenv').config();
const jwt = require('jsonwebtoken');

const { JWT_SECRET = 'development-secret' } = process.env;

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  try {
    req.user = jwt.verify(token, JWT_SECRET).id;
    next();
  } catch (e) {
    const err = new Error('Необходима авторизация');
    err.statusCode = 401;
    next(err);
  }
};
