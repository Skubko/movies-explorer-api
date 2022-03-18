require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const { optionsCORS } = require('./utils/constants');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { BD_URL = 'mongodb://localhost:27017/bitfilmsdb' } = process.env;

mongoose.connect(BD_URL, {
  useNewUrlParser: true,
});

const app = express();

app.use(cors(optionsCORS));
app.use(helmet());

app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);

app.use(require('./routers/index'));

app.use(errorLogger);
app.use(errors());
app.use(require('./middlewares/errors'));

module.exports = app;
