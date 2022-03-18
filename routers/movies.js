const router = require('express').Router();
const {
  validationAddMovie,
  validationDeleteMovie,
} = require('../utils/validation');
const {
  getMovies,
  addMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', getMovies);
router.post('/', validationAddMovie, addMovie);
router.delete('/:movieId', validationDeleteMovie, deleteMovie);

module.exports = router;
