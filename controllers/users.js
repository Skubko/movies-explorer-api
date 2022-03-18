require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { JWT_SECRET = 'development-secret', NODE_ENV } = process.env;

function createUser(req, res, next) {
  const { email, password, name } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        email,
        password: hash,
        name,
      })
        .then(({ _id: id }) => res.send({ id }))
        .catch((e) => {
          if (e.name === 'ValidationError') {
            const err = new Error('Данные невалидны');
            err.statusCode = 400;
            next(err);
          } else if (e.name === 'MongoServerError' && e.code === 11000) {
            const err = new Error('Пользователь с таким email уже существует');
            err.statusCode = 409;
            next(err);
          } else next(e);
        });
    })
    .catch(next);
}

function getUser(req, res, next) {
  const id = req.user;

  User.findById(id)
    .then((user) => {
      if (user) res.status(200).send(user);
      else {
        const err = new Error('Пользователь ненайден');
        err.statusCode = 404;
        throw err;
      }
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        const err = new Error('ID пользователя невалиден');
        err.statusCode = 400;
        next(err);
      } else next(e);
    });
}

function updateUser(req, res, next) {
  const { name, email } = req.body;
  const id = req.user;

  User.findByIdAndUpdate(id, { name, email }, { new: true, runValidators: true })
    .then((user) => {
      if (user) res.status(200).send(user);
      else {
        const err = new Error('Пользователь ненайден');
        err.statusCode = 404;
        throw err;
      }
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        const err = new Error('Данные невалидны');
        err.statusCode = 400;
        next(err);
      } else if (e.code === 11000) {
        const err = new Error('Пользователь с таким email уже существует');
        err.statusCode = 409;
        next(err);
      } else next(e);
    });
}

function login(req, res, next) {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        const err = new Error('Неверный логин или пароль');
        err.statusCode = 401;
        throw err;
      }
      bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            const err = new Error('Неверный логин или пароль');
            err.statusCode = 401;
            throw err;
          }
          const { _id: id } = user;
          const token = jwt.sign(
            { id },
            JWT_SECRET,
            { expiresIn: '7d' },
          );
          res.cookie('jwt', token, {
            maxAge: 3600000,
            httpOnly: true,
            secure: NODE_ENV === 'production',
          });
          res.status(200).send({ id });
        })
        .catch(next);
    })
    .catch(next);
}

function logoff(req, res) { res.clearCookie('jwt').end(); }

module.exports = {
  getUser,
  updateUser,
  login,
  logoff,
  createUser,
};
