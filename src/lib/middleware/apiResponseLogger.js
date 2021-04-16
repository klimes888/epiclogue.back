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
    isMember: false,
    statusCode: res.statusCode,
    resData: res.data,
  }

  if (res.error) {
    loggingObject = {
      ...loggingObject,
      errorName: res.error.name,
      errorMessage: res.error.message,
      stack: res.error?.stack,
    }
  }

  if (res.accessToken) {
    loggingObject = { ...loggingObject, accessToken: res.accessToken }
    loggingObject.isMember = true
  }

  if (res.statusCode > 499) {
    return stream.writeDetailError(JSON.stringify(loggingObject))
  }

  stream.writeDetailInfo(JSON.stringify(loggingObject))
}
