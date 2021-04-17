import dayjs from 'dayjs'

import { logger } from '../../configs/winston'

/**
 * Reponse logging middleware
 */
export const apiResponseLogger = async (req, res) => {
  let loggingObject = {
    timestamp: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss Z'),
    sessionId: res.sessionId,
    type: 'response',
    isMember: req.user.isMember || false,
    requestUserId: req.user.id || null,
    accessToken: req.user.accessToken || null,
    accessCount: req.user.accessCount || 1,
    statusCode: res.statusCode,
    resData: res.data || null,
    resDataKiloBytes: res.data ? (JSON.stringify(res.data).length / 1000).valueOf() : 0,
    resposneTimeMs: new Date().getTime() - req.time || null,
  }

  if (res.error) {
    loggingObject = {
      ...loggingObject,
      errorName: res.error.name,
      errorMessage: res.error.message,
      stack: res.error?.stack,
    }
  }

  if (res.statusCode > 499) {
    return logger.error(JSON.stringify(loggingObject))
  }

  logger.info(JSON.stringify(loggingObject))
}
