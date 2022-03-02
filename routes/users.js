const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');

const {
  getUserMe, createUser, updateUserMe, login, signout,
} = require('../controllers/users');

// Вернет инфо, о пользователе.
router.get('/users/me', auth, getUserMe);

// Обновит инфо, о пользователе.
router.patch('/users/me', auth, celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(30),
  }),
}), updateUserMe);

// Регистрация.
router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
  }),
}), createUser);

// Вход, вернет JWT c COOKIES.
router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

// Выход, удалит COOKIES с JWT.
router.post('/signout', auth, signout);

module.exports = router;
