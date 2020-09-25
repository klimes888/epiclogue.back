// external modules
import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import dotenv from 'dotenv'
import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'

// routers
import indexRouter from './src/routes'
import usersRouter from './src/routes/user'
import boardRouter from './src/routes/board'
import searchRouter from './src/routes/search'
import interactionRouter from './src/routes/interaction'
import authRouter from './src/routes/auth'

// utils
import Database from './src/lib/database'
import { logger, stream } from './src/configs/winston'

const app = express()
dotenv.config()
dayjs.extend(dayjsPluginUTC)

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
app.use(morgan('combined', {
  stream,
  skip: (req, res) => { return res.statusCode > 399 }
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(helmet())

Database.connect()

app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/user', usersRouter)
app.use('/boards', boardRouter)
app.use('/interaction', interactionRouter)
app.use('/search', searchRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // if (process.env.NODE_ENV !== 'production') { }
  const errObject = {
    req: { route: req.route, url: req.url, method: req.method, headers: req.headers }, err: { message: err.message, stack: err.stack, status: err.status },
    user: res.locals.uid
  }

  logger.error(`${dayjs().local().format('YYYY-MM-DD HH:mm:ss')}`, errObject)

  res.locals.message = err.message
  res.locals.error = err
  return res.status(err.status || 500).json({
    result: 'error',
    message: err.message || "Internal server error",
    data: err.properties
  })
})

module.exports = app
