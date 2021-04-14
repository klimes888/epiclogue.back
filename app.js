// external modules
import './src/env/env'
import express from 'express'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import hpp from 'hpp'
import swaggerUi from 'swagger-ui-express'
import session from 'express-session'
import Slack from 'slack-node'

// routers
import indexRouter from './src/routes'

// utils
import { connect } from './src/lib/database'
import { logger, stream } from './src/configs/winston'
import { swaggerSpec } from './src/configs/apiDoc'
import { apiResponser } from './src/lib/apiResponser'
import { apiRequestLogger } from './src/lib/middleware/apiRequestLogger'

const app = express()

app.use(cors({ credentials: true, origin: true }))
// if (process.env.NODE_ENV === 'production') {
//   app.use(morgan('combined', { stream }));
// } else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
//   app.use(morgan('dev', { stream }));
// }
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 1000 // 1h
  }
}))
app.use(hpp())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(helmet())

app.use(apiRequestLogger)

connect()

app.use('/', indexRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const notFoundError = new Error()
  notFoundError.status = 404
  notFoundError.name = "NotFoundException"
  notFoundError.message = "올바른 접근이 아닙니다."
  next(notFoundError)
})

// error handler
app.use((err, req, res) => {
  const statusCode = err.status || 500
  const errorMessage = err.message || 'Internal server error'

  if (!process.env.NODE_ENV === 'test' && err.status === 500) {
    // Only alert on 500 error
    const slack = new Slack()
    slack.setWebhook(process.env.SLACK_WEBHOOK)
    slack.webhook(
      {
        text: `*Message*: ${err.message} \n *Stack*: ${err.stack} \n *StatusCode*: ${err.status}`,
      },
      webhookError => {
        if (webhookError) console.error(webhookError)
      }
    )
  }

  logger.error(`StatusCode: ${statusCode}, Message: ${errorMessage}`)

  res.locals.message = err.message
  res.locals.error = err

  return apiResponser(res, statusCode, errorMessage)
})

export default app
