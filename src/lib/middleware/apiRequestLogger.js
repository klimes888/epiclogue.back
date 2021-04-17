import dayjs from 'dayjs'

import { stream } from '../../configs/winston'

/**
 * API로 요청한 클라이언트의 세션과 토큰을 검사하여 로그를 남기는 미들웨어
 */
export const apiRequestLogger = (req, res) => {
  const requestTime = new Date().getTime()

  const loggingObject = {
    timestamp: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss Z'),
    type: 'request',
    originalUrl: req.originalUrl,
    sessionId: req.session.id,
    reqMethod: req.method,
    reqHeaders: req.headers,
    reqBody: req.body,
    isMember: req.user.isMember || false,
    requestUserId: req.user.id || null,
    accessToken: req.user.accessToken || null,
    accessCount: req.user.accessCount || 1,
  }

  req.time = requestTime
  res.sessionId = req.session.id
  res.accessToken = req.cookies.access_token

  stream.writeDetailInfo(JSON.stringify(loggingObject))
}
