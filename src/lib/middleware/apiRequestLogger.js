import dayjs from 'dayjs'

import { stream } from '../../configs/winston'
import redisClient from '../redisClient'

/**
 * API로 요청한 클라이언트의 세선과 토큰을 검사하여 로그를 남기는 미들웨어
 */
export const apiRequestLogger = async (req, res, next) => {
  if (!req.session.views) {
    req.session.views = 1
  } else if (req.session.views) {
    req.session.views += 1
  }

  // 한 시간 동안 한 세션이 몇 개의 페이지를 옮겨다녔는지 저장하기 위해 Redis에 저장
  redisClient.setAsync(req.session.id, req.session.views)

  let loggingObject = {
    timestamp: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss Z'),
    sessionId: req.session.id,
    views: req.session.views,
    originalUrl: req.originalUrl,
    reqHeaders: req.headers,
    reqMethod: req.method,
    reqBody: req.body,
  }

  if (req.cookies.access_token) {
    loggingObject = { ...loggingObject, accessToken: req.cookies.access_token }
  }

  stream.writeDetail(JSON.stringify(loggingObject))
  next()
}
