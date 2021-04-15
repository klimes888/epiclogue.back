// external modules
import './src/env/env'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import hpp from 'hpp'
import swaggerUi from 'swagger-ui-express'
import session from 'express-session'

// routers
import indexRouter from './src/routes'

// utils
import { connectDatabase } from './src/lib/database'
import { swaggerSpec } from './src/configs/apiDoc'
import { apiResponser } from './src/lib/apiResponser'
import { apiRequestLogger } from './src/lib/middleware/apiRequestLogger'
import { apiResponseLogger } from './src/lib/middleware/apiResponseLogger'
import { errorLogger } from './src/lib/middleware/errorLogger'

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

connectDatabase()

// HttpRequestLogger
app.use(apiRequestLogger)

app.use('/', indexRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use((req, res, next) => {
  const notFoundError = new Error()
  notFoundError.status = 404
  notFoundError.name = "NotFoundException"
  notFoundError.message = "올바른 접근이 아닙니다."
  next(notFoundError)
})

app.use(errorLogger)

export default app
