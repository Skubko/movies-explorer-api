const router = require('express').Router();
const {
  validationLogin,
  validationCreateUser,
} = require('../utils/validation');
const {
  login,
  logoff,
  createUser,
} = require('../controllers/users');

router.post('/signin', validationLogin, login);
router.post('/signout', logoff);
router.post('/signup', validationCreateUser, createUser);

router.use(require('../middlewares/auth'));

router.use('/users', require('./users'));
router.use('/movies', require('./movies'));
router.use(require('../middlewares/notFound'));

module.exports = router;
