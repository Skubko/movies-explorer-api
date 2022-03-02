const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Conflict = require('../errors/conflict-err');
const BadRequestErrors = require('../errors/bad-request-err');
const UnauthorizedErrors = require('../errors/unauthorized-err');
const NotFoundError = require('../errors/not-found-err');

const { NODE_ENV, JWT_SECRET, JWT_DEV = 'some-secret-key' } = process.env;
const secretKey = NODE_ENV === 'production' ? JWT_SECRET : JWT_DEV;

const opts = { runValidators: true, new: true }; // Перенести в фаил констант

// Получить конкретного пользователя
module.exports.getUserMe = (req, res, next) => {
  const { _id } = req.user;

  User.findById(_id)
    .orFail(() => next(new NotFoundError('Пользователь по указанному ID не найден')))
    .then((dataUser) => {
      res.send({
        email: dataUser.email,
        name: dataUser.name,
      });
    })
    .catch(next);
};

// Обновляет информицию пользоватиеля
module.exports.updateUserMe = (req, res, next) => {
  const { _id } = req.user;
  const { name, email } = req.body;

  User.findByIdAndUpdate(_id, { name, email }, opts)
    .orFail(() => next(new NotFoundError('Пользователь по указанному ID не найден')))
    .then((dataUser) => res.send({
      email: dataUser.email,
      name: dataUser.name,
    }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestErrors('Передан не корректный ID польщователя'));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestErrors('Переданы некорректные данные пользователя'));
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        return next(new Conflict('Что-то пошло не так'));
      }
      return next(err);
    });
};

// Регистрация нового пользователя
module.exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        next(new Conflict('Произошла ошибка'));
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    })
      .then(() => {
        res
          .status(201)
          .send({
            email, name,
          });
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return next(new NotFoundError('Переданы некорректные данные пользователя'));
        }
        if (err.name === 'MongoError' && err.code === 11000) {
          return next(new Conflict('Что-то пошло не так'));
        }
        return next(err);
      })
      .catch(next));
};

// Авторизация пользователя
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedErrors('Запрошенный пользователь не найден'));
      }
      return bcrypt.compare(password, user.password)
        .then((isMatched) => {
          if (!isMatched) {
            return next(new UnauthorizedErrors('Неверный email или пароль'));
          }
          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        secretKey,
        { expiresIn: '7d' },
      );
      return res
        .status(201)
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: 'None',
          secure: true,
        })
        .send({ message: 'Авторизация успешно пройдена' });
    })
    .catch(() => next(new Conflict('Неверный email или пароль')));
};

// Выход пользователя из системы
module.exports.signout = (req, res) => {
  res.clearCookie('jwt').send({ message: 'Успешный выход' });
};
