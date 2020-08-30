const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const debug = require('debug')(process.env.DEBUG)
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const boardRouter = require('./routes/board')
const searchRouter = require('./routes/search')
const reactRouter = require('./routes/react')

const app = express();

require('dotenv').config();

const swaggerDefinition = {
  info: { // API informations (required)
    title: 'lunarcat Service', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'lunarcat service API' // Description (optional)
  },  
  host: 'api.chiyak.duckdns.org', // Host (optional)
  basePath: '/', // Base path (optional)
  schemes:["https"]
};

const options = {
  // Import swaggerDefinitions
  swaggerDefinition,
  // Path to the API docs
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

app.use(cors({credentials:true, origin:true}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/boards', boardRouter);
app.use('/interaction/:screenId/like', require('./routes/like'));
app.use('/interaction/:screenId/follow', require('./routes/follow'))
app.use('/interaction/:screenId/bookmark', require('./routes/bookmark'))
app.use('/search', searchRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(() => console.log('데이터베이스 연결 성공'))
  .catch(e => console.error(e));

module.exports = app;
