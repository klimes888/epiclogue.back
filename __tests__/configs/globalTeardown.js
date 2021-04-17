import { logger } from '../../src/configs/winston'
import Database from '../../src/lib/database'

module.exports = async () => {
  await Database.disconnect()
  logger.info(`[JestGlobalTeardown] Test successfully ended!`)
  process.exit(0)
}
