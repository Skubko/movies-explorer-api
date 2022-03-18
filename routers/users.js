const router = require('express').Router();
const { validationUpdateUser } = require('../utils/validation');
const {
  getUser,
  updateUser,
} = require('../controllers/users');

router.get('/me', getUser);
router.patch('/me', validationUpdateUser, updateUser);

module.exports = router;
