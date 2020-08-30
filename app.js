import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import indexRouter from './src/routes';
import usersRouter from './src/routes/user';
import boardRouter from './src/routes/board'
import searchRouter from './src/routes/search'
import interactionRouter from './src/routes/interaction'
import dotenv from 'dotenv'

const app = express();

dotenv.config();

const swaggerDefinition = {
  info: { // API informations (required)
    title: 'lunarcat Service', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'lunarcat service API' // Description (optional)
  },  
  host: 'api.epiclogue.tk', // Host (optional)
  basePath: '/', // Base path (optional)
  schemes:["https"]
};

const options = {
  // Import swaggerDefinitions
  swaggerDefinition,
  // Path to the API docs
  apis: ['./apidoc.yaml']
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
app.use('/interaction', interactionRouter);
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

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('데이터베이스 연결 성공'))
  .catch(e => console.error(e));

module.exports = app;
