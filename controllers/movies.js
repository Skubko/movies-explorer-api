const Movie = require('../models/movie');
const BadRequestErrors = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenErrors = require('../errors/forbidden-err');

// Получить все фильмы пользователя
module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => {
      res.send(movies);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError('Запрошенные карточки не найдены'));
      }
      next(err);
    });
};

// Добавление нового фильма
module.exports.addMovie = (req, res, next) => {
  const {
    country, director, duration, year, description, image,
    trailer, thumbnail, movieId, nameRU, nameEN,
  } = req.body;
  const { _id } = req.user;
  //
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    owner: _id,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestErrors('Переданы некорректные данные карточки'));
      }
      next(err);
    });
};

// Удалить фильм
module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const { _id } = req.user;

  Movie.findById(movieId)
    .orFail(() => {
      next(new NotFoundError('Фильм по данному ID не найден'));
    })
    .then((movie) => {
      if (_id === movie.owner.toString() || null) {
        Movie.findByIdAndRemove(movie)
          .then((movieRemove) => {
            res.send({ movieRemove });
          })
          .catch(next);
      } else {
        next(new ForbiddenErrors('Данная карточка принадлежит не вам'));
      }
    })
    .catch((err) => {
      if (err.message === 'NotValidID') {
        next(new NotFoundError('Карточка с таким ID не нвйдена в базе'));
      }
      if (err.name === 'CastError') {
        next(new BadRequestErrors('Передан некорректный ID карточки'));
      }
      next(err);
    });
};
