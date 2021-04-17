import dayjs from 'dayjs'

import { stream } from '../../configs/winston'

/**
 * Access logging middleware
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
