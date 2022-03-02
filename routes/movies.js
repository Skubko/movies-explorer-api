const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const auth = require('../middlewares/auth');

const {
  getMovies, addMovie, deleteMovie,
} = require('../controllers/movies');

const method = (value) => {
  const result = validator.isURL(value, { require_protocol: true });
  if (result) {
    return value;
  }
  throw new Error('URL в веден не корректно');
};

// Вернет все фильмы конкретного пользователя
router.get('/movies', auth, getMovies);

// Создает фильм с переданными в теле полями
router.post('/movies', auth, celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom(method),
    trailer: Joi.string().required().custom(method),
    thumbnail: Joi.string().required().custom(method),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), addMovie);

// Удаляет фильм по id
router.delete('/movies/:movieId', auth, celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().hex().length(24),
  }),
}), deleteMovie);

module.exports = router;
