require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const cors = require('cors');
const error = require('./middlewares/error');
const NotFoundError = require('./errors/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const limiter = require('./middlewares/limiter');
const router = require('./routes');

const { PORT = 3000 } = process.env;
const app = express();
const CorsAllowedList = [
  'https://api.movies.skubko.nomoredomains.rocks', // бэкенд
  'http://api.movies.skubko.nomoredomains.rocks',
  'http://localhost:3000',
  'https://localhost:3000',
  'localhost:3000',
  'https://movies.skubko.nomoredomains.rocks', // фронтенд
  'http://movies.skubko.nomoredomains.rocks',
];
const corsOption = {
  credentials: true,
  origin: function checkCorsList(origin, callback) {
    if (CorsAllowedList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(limiter);
app.use(cors(corsOption));

app.use(requestLogger); // подключаем логгер запросов   // за ним идут все обработчики роутов
app.use(bodyParser.json());
app.use(helmet());
app.disable('x-powered-by');
app.use(bodyParser.urlencoded({
  extended: true,
}));

// const db = process.env.NODE_ENV === 'production' ? process.env.DB_ADDRESS : 'mongodb://localhost:27017/moviesdb';
mongoose.connect('mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
  autoIndex: true,
});

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(router);
app.use(errorLogger);
app.use('*', () => { throw new NotFoundError('Запрашиваемый ресурс не найден'); });

app.use(errors());
app.use(error);
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
