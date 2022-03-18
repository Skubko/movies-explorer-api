const Movie = require('../models/movie');

function getMovies(req, res, next) {
  const owner = req.user;

  Movie.find({ owner })
    .then((movies) => res.status(200).send([...movies]))
    .catch(next);
}

function addMovie(req, res, next) {
  const data = req.body;
  const owner = req.user;

  Movie.create({ ...data, owner })
    .then((movie) => res.status(200).send(movie))
    .catch((e) => {
      if (e.name === 'ValidationError') {
        const err = new Error('Данные невалидны');
        err.statusCode = 400;
        next(err);
      } else next(e);
    });
}

function deleteMovie(req, res, next) {
  const { movieId } = req.params;
  const owner = req.user;

  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        const err = new Error('Фильм ненайден');
        err.statusCode = 404;
        throw err;
      }

      if (movie.owner.toString() === owner) {
        movie.remove()
          .then(() => res.status(200).send({ message: 'Фильм удален' }))
          .catch(next);
      } else {
        const err = new Error('Нет прав для удаления');
        err.statusCode = 403;
        throw err;
      }
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        const err = new Error('ID невалиден');
        err.statusCode = 400;
        next(err);
      } else next(e);
    });
}

module.exports = {
  getMovies,
  addMovie,
  deleteMovie,
};
