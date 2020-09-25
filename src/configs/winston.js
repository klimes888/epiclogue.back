import winston from 'winston'
import fs from 'fs'

const logDir = __dirname + '/../../logs'

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const infoTransport = new winston.transports.File({
  filename: 'combined.log',
  dirname: logDir,
  level: 'info'
})

const errorTransport = new winston.transports.File({
  filename: 'error.log',
  dirname: logDir,
  level: 'error'
})

const logger = winston.createLogger({
  transports: [infoTransport, errorTransport],
  exitOnError: false
})

const stream = {
  write: message => {
    logger.info(message)
  }
}

export { logger, stream }