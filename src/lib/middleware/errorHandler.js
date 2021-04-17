import dayjs from 'dayjs'
import Slack from 'slack-node'

import { logger } from '../../configs/winston'
import { apiResponser } from './apiResponser'

/**
 *  발생한 에러를 받아 처리하는 미들웨어
 */
export const errorHandler = (err, req, res) => {
  const apiError = err

  const statusCode = apiError.status || 500
  const errorMessage = apiError.message || 'Internal server error'
  const errorObject = {
    timestamp: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss Z'),
    sessionId: res.sessionId,
    message: errorMessage,
    statusCode: apiError.status,
    stack: apiError?.stack,
  }

  if (process.env.NODE_ENV !== 'test' && statusCode === 500) {
    const slack = new Slack()
    slack.setWebhook(process.env.SLACK_WEBHOOK)
    slack.webhook(JSON.stringify(errorObject), webhookError => {
      if (webhookError) logger.error(webhookError)
    })
  }

  // 다른 미들웨어에서 에러 오브젝트를 사용하기 위해 내재화
  res.error = apiError

  apiResponser({ req, res, statusCode, message: errorMessage })
}
