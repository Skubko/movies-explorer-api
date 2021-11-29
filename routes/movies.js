const router = require('express').Router();
const auth = require('../middlewares/auth');
const { getMovies, deleteMovies, createMovies } = require('../controllers/movies');
const { validateMovieParams, validateMovieBody } = require('../middlewares/validations');

router.get('/movies', getMovies);
router.post('/movies', validateMovieBody, createMovies);
router.delete('/movies/:id', validateMovieParams, deleteMovies);
router.use(auth);

module.exports = router;
