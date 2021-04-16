import dayjs from 'dayjs'

import { stream } from '../../configs/winston'

/**
 * API response logging middleware
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

  stream.writeDetailInfo(JSON.stringify(loggingObject))
}
