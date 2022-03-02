const router = require('express').Router();
const userRoutes = require('./users');
const movieRouter = require('./movies');
const router404 = require('./not-found');

router.use(userRoutes);
router.use(movieRouter);
router.use(router404);

module.exports = {
  router,
};
