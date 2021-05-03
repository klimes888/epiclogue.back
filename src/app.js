// external modules
import './env/env'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import hpp from 'hpp'
import swaggerUi from 'swagger-ui-express'
import session from 'express-session'
import connectRedis from 'connect-redis'

// routers
import indexRouter from './routes'

// utils
import { connectDatabase } from './lib/database'
import { swaggerSpec } from './configs/apiDoc'
import { apiRequestHandler } from './lib/middleware/apiRequestHandler'
import { errorHandler } from './lib/middleware/errorHandler'
import { apiResponser } from './lib/middleware/apiResponser'
import redisClient from './lib/redisClient'

const app = express()
const RedisStore = connectRedis(session)

/**
 * Initialize middlewares
 */
app.use(cors({ credentials: true, origin: process.env.NODE_ENV === 'production' ? '.epiclogue.com' : true }))
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: new RedisStore({ client: redisClient.getClient, url: process.env.REDIS_URL }),
    cookie: {
      httpOnly: true,
      maxAge: 3600000, // 1h to ms
      sameSite: process.env.NODE_ENV === 'test' ? 'None' : 'Lax',
      domain: process.env.NODE_ENV === 'test' ? 'localhost:3000' : '.epiclogue.com',
    },
  })
)
app.use(hpp())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(helmet())

connectDatabase()
app.use(apiRequestHandler)

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
 * catch 404 Error.
 * 
 * ExpressJS 문서(https://expressjs.com/en/starter/faq.html)에서
 * 미들웨어 최하단에 404 에러를 핸들링하도록 권장
 */
app.use((req, res) => {
  apiResponser({ req, res, statusCode: 404, message: '올바른 접근이 아닙니다.', })
})


export default app
