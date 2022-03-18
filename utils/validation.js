const { celebrate, Joi } = require('celebrate');
const { isURL } = require('validator');

const validationAddMovie = celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom((v, h) => {
      if (isURL(v)) return v;
      return h.message('Поле image заполнено некорректно');
    }),
    trailerLink: Joi.string().required().custom((v, h) => {
      if (isURL(v)) return v;
      return h.message('Поле trailer заполнено некорректно');
    }),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
});

const validationDeleteMovie = celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().required().min(24).max(24)
      .hex(),
  }),
});

const validationUpdateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
  }),
});

const validationLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(9),
  }),
});

const validationCreateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(9),
  }),
});

module.exports = {
  validationAddMovie,
  validationDeleteMovie,
  validationUpdateUser,
  validationLogin,
  validationCreateUser,
};
