import { logger } from '../../src/configs/winston'
import { disconnectDatabase } from '../../src/lib/database'

module.exports = async () => {
  await disconnectDatabase()
  logger.info(`[JestGlobalTeardown] Test successfully ended!`)
  process.exit(0)
}
