import dayjs from 'dayjs'

import { stream } from '../../configs/winston'
import redisClient from '../redisClient'

/**
 * API로 요청한 클라이언트의 세션과 토큰을 검사하여 로그를 남기는 미들웨어
 */
export const apiRequestLogger = async (req, res, next) => {
  let loggingObject = {
    timestamp: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss Z'),
    sessionId: req.session.id,
    type: 'request',
    reqMethod: req.method,
    originalUrl: req.originalUrl,
    reqHeaders: req.headers,
    reqBody: req.body,
  }

  if (req.cookies.access_token) {
    loggingObject = { ...loggingObject, accessToken: req.cookies.access_token }
  }

  const sessionViews = await redisClient.getAsync(req.session.id)
  // view count를 올려주는 것은 apiResponseLogger 를 만들고 response 를 내준 다음에 하는 것으로
  // 변경 필요
  if (sessionViews) {
    redisClient.setWithTtl(req.session.id, 3600, parseInt(sessionViews, 10) + 1)
    loggingObject.views = parseInt(sessionViews, 10) + 1
  } else if (!sessionViews) {
    redisClient.setWithTtl(req.session.id, 3600, 1)
    loggingObject.views = 1
  }

  res.sessionId = req.session.id
  res.accessToken = req.cookies.access_token

  stream.writeDetailInfo(JSON.stringify(loggingObject))
  next()
}
