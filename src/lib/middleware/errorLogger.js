import Slack from 'slack-node'

import { stream } from '../../configs/winston'
import { apiResponser } from '../apiResponser'

export const errorLogger = async (err, req, res) => {
  const statusCode = err.status || 500
  const errorMessage = err.message || 'Internal server error'

  if (!process.env.NODE_ENV === 'test' && err.status === 500) {
    const slack = new Slack()
    slack.setWebhook(process.env.SLACK_WEBHOOK)
    slack.webhook(
      {
        text: `*Message*: ${err.message} \n *Stack*: ${err.stack} \n *StatusCode*: ${err.status}`,
      },
      webhookError => {
        if (webhookError) console.error(webhookError)
      }
    )
  }

  stream.writeDetail(`StatusCode: ${statusCode}, Message: ${errorMessage}`)

  res.locals.message = err.message
  res.locals.error = err

  return apiResponser(res, statusCode, errorMessage)
}
