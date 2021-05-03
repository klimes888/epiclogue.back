#!/usr/bin/env node

/**
 * Module dependencies.
 */

import debug from 'debug'
import http from 'http'
import dayjs from 'dayjs'
import Slack from 'slack-node'

import '../env/env'
import app from '../app'
import { logger } from '../configs/winston'

debug('lunacat-api:server')

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

/**
 * Create HTTP server.
 */

const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)
server.on('close', onClose)
process.on('uncaughtException', err => {
  logger.error(`***UNCAUGHT EXCEPTION: ${err}`)
  
  if (process.env.NODE_ENV !== 'test') {
    const slack = new Slack()
    const errorObjectForSlack = {
      timestamp: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss Z'),
      message: err.message,
      statusCode: err?.status,
      stack: err?.stack,
    }

    slack.setWebhook(process.env.SLACK_WEBHOOK)
    slack.webhook(JSON.stringify(errorObjectForSlack), webhookError => {
      if (webhookError) logger.error(`[SlackWebhookError] ${webhookError}`)
    })
  }

  process.exit(1)
})
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const normalizedPort = parseInt(val, 10)

  if (Number.isNaN(normalizedPort)) {
    // named pipe
    return val
  }

  if (normalizedPort >= 0) {
    // port number
    return normalizedPort
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  logger.error(error)

  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address()
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`
  debug(`Listening on ${bind}`)
}

function onClose() {
  server.close()
}
