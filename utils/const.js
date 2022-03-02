require('dotenv').config();

const {
  mongoURL = 'mongodb://localhost:27017/moviesdb',
  PORT = 3000,
} = process.env;

const optionsMongooseConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

module.exports = {
  optionsMongooseConfig,
  mongoURL,
  PORT,
};
