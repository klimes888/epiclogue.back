// external modules
import './src/env/env'
import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
import Slack from 'slack-node'

// routers
import indexRouter from './src/routes'

// utils
import {connect} from './src/lib/database'
import { logger, stream } from './src/configs/winston'

const app = express()
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

app.use(cors({ credentials: true, origin: process.env.NODE_ENV === 'production' ? '.epiclogue.com' : true }))
app.use(
  morgan('combined', {
    stream,
    skip: (req, res) => res.statusCode > 399,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(helmet())

connect()

app.use('/', indexRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404, '올바른 접근이 아닙니다.'))
})

// error handler
app.use((err, req, res) => {
  // if (process.env.NODE_ENV !== 'production') { }

  if (!process.env.NODE_ENV === 'test' && err.status === 500) {
    // Only alert on 500 error
    const slack = new Slack()
    slack.setWebhook(process.env.SLACK_WEBHOOK)
    slack.webhook(
      {
        text: `*Message*: ${err.message} \n *Stack*: ${err.stack} \n *StatusCode*: ${err.status}`,
      },
      (webhookError) => {
        if (webhookError) console.error(webhookError)
      }
    )
  }

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
