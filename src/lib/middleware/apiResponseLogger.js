import dayjs from 'dayjs'

import { stream } from '../../configs/winston'

/**
 * API response를 logging을 하는 미들웨어
 */
export const apiResponseLogger = async (req, res) => {
  let loggingObject = {
    timestamp: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss Z'),
    sessionId: res.sessionId,
    type: 'response',
    statusCode: res.statusCode,
    resData: res.data,
  }

  if (res.accessToken) {
    loggingObject = { ...loggingObject, accessToken: res.accessToken }
  }

  stream.writeDetail(JSON.stringify(loggingObject))
}
