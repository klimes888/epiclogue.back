// external modules
import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import dotenv from 'dotenv'

// routers
import indexRouter from './src/routes'
import usersRouter from './src/routes/user'
import boardRouter from './src/routes/board'
import searchRouter from './src/routes/search'
import interactionRouter from './src/routes/interaction'
import authRouter from './src/routes/auth'

// utils
import Database from './src/lib/database'

const app = express()
dotenv.config()

const swaggerDefinition = {
  info: {
    // API informations (required)
    title: 'epiclogue API', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'epiclogue service API', // Description (optional)
  },
  host: 'api.epiclogue.tk', // Host (optional)
  basePath: '/', // Base path (optional)
  schemes: ['https'],
}

const options = {
  // Import swaggerDefinitions
  swaggerDefinition,
  // Path to the API docs
  apis: ['./apidoc.yaml'],
}

const swaggerSpec = swaggerJSDoc(options)

app.use(cors({ credentials: true, origin: true }))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(helmet())
app.use(express.static(path.join(__dirname, 'public')))

Database.connect()

app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/user', usersRouter)
app.use('/boards', boardRouter)
app.use('/interaction', interactionRouter)
app.use('/search', searchRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, '올바른 접근이 아닙니다.'))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500).json({
    result: 'error',
    message: err.message,
  })
})


module.exports = app
