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
import { apiRequestLogger } from './src/lib/middleware/apiRequestLogger'
import { errorHandler } from './src/lib/middleware/errorHandler'
import { apiResponser } from './src/lib/middleware/apiResponser'

const app = express()

/**
 * Initialize middlewares
 */
app.use(cors({ credentials: true, origin: true }))
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 1000, // 1h
  }
}))
app.use(hpp())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(helmet())

connectDatabase()
app.use(apiRequestLogger)

/**
 * Routers
 */
app.use('/', indexRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  if (err) {
    return errorHandler(err, req, res)  
  }

  next()
})

/**
 * catch 404 Error
 */
app.use((req, res) => {
  apiResponser({ req, res, statusCode: 404, message: "올바른 접근이 아닙니다.", })
})


export default app
