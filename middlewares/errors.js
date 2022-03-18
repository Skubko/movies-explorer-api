module.exports = (err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере произошла ошибка'
      : message,
  });
  if (statusCode === 500) console.log(`Ошибка ${err.name}: ${message}`);

  next();
};
