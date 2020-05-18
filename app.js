const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const joinRouter = require('./routes/join');
const passwordChangeRouter = require('./routes/password-change');
const showAllDataRouter = require('./routes/show-all-data');
const deleteAccountRouter = require('./routes/delete-account');
const showBoardRouter = require('./routes/board');
const viewRouter = require('./routes/view');
const profileRouter = require('./routes/profile');
const settingsRouter = require('./routes/settings');

const session = require('express-session');                      
const FileStore = require('session-file-store')(session);    

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/static', express.static(__dirname + '/public'));

app.use(session({                                              
  secret:"lunakey",
  resave:false,
  saveUninitialized:true,
  store: new FileStore()                                         
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/join', joinRouter);
app.use('/password-change', passwordChangeRouter);
app.use('/show-all-data', showAllDataRouter);
app.use('/delete-account', deleteAccountRouter);
app.use('/board', showBoardRouter);
app.use('/view', viewRouter);
app.use('/profile', profileRouter);
app.use('/settings', settingsRouter);
// app.use('/img', express.static('public/uploads'));

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

module.exports = app;
