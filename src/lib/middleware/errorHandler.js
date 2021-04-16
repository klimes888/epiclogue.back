import dayjs from 'dayjs'
import Slack from 'slack-node'

import { logger, stream } from '../../configs/winston'
import { apiResponser } from '../apiResponser'

export const errorResponser = (err, req, res) => {
  let apiError = err
  if (!err) {
    apiError = new Error()
    apiError.statusCode = 404
    apiError.name = "NotFoundException"
    apiError.message = "올바른 접근이 아닙니다."
  }

  const statusCode = apiError.status || 500
  const errorMessage = apiError.message || 'Internal server error'
  const errorObject = {
    timestamp: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss Z'),
    sessionId: res.sessionId,
    message: errorMessage,
    stack: apiError?.stack,
    statusCode: apiError.status
  }

  if (!process.env.NODE_ENV === 'test' && apiError.status === 500) {
    const slack = new Slack()
    slack.setWebhook(process.env.SLACK_WEBHOOK)
    slack.webhook(JSON.stringify(errorObject), webhookError => {
      if (webhookError) stream.writeDetailError(webhookError)
    })
  }

  stream.writeDetailError(JSON.stringify(errorObject))

  // res.locals.message = errorMessage
  // res.locals.error = apiError

  apiResponser({ req, res, statusCode, message: errorMessage })
}
