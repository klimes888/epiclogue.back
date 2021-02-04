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
import dotenvExpand from 'dotenv-expand'
import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
import Slack from 'slack-node'

// routers
import indexRouter from './src/routes'
import usersRouter from './src/routes/user'
import boardRouter from './src/routes/board'
import searchRouter from './src/routes/search'
import suggestRouter from './src/routes/suggest'
import interactionRouter from './src/routes/interaction'
import authRouter from './src/routes/auth'
import notiRouter from './src/routes/notification'
import myboardRouter from './src/routes/myboard'

// utils
import Database from './src/lib/database'
import { logger, stream } from './src/configs/winston'

const app = express()
dotenvExpand(dotenv.config())
dayjs.extend(dayjsPluginUTC)

// Swagger setting
const swaggerDefinition = {
  info: {
    // API informations (required)
    title: 'epiclogue API', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'epiclogue service API', // Description (optional)
  },
  host: 'api.epiclogue.com', // Host (optional)
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
app.use(
  morgan('combined', {
    stream,
    skip: (req, res) => {
      return res.statusCode > 399
    },
  })
)
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
app.use('/suggest', suggestRouter)
app.use('/notification', notiRouter)
app.use('/myboard', myboardRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, '올바른 접근이 아닙니다.'))
})

// error handler
app.use((err, req, res, next) => {
  // if (process.env.NODE_ENV !== 'production') { }

  // if (err.status === 500) {
  //   // Only alert on 500 error
  //   const slack = new Slack()
  //   slack.setWebhook(process.env.SLACK_WEBHOOK)
  //   slack.webhook(
  //     {
  //       text: `*Message*: ${err.message} \n *Stack*: ${err.stack} \n *StatusCode*: ${err.status}`,
  //     },
  //     (err, response) => {
  //       if (err) console.error(err)
  //     }
  //   )
  // }

  const errObject = {
    req: { route: req.route, url: req.url, method: req.method, headers: req.headers },
    err: { message: err.message, stack: err.stack, status: err.status },
    user: res.locals.uid,
  }

  logger.error(`${dayjs().local().format('YYYY-MM-DD HH:mm:ss')}`, errObject)

  res.locals.message = err.message
  res.locals.error = err

  return res.status(err.status || 500).json({
    result: 'error',
    message: err.message || 'Internal server error',
    data: err.properties,
  })
})

export default app
