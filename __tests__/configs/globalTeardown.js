import { disconnectDatabase, dropDatabase } from '../../src/lib/database'

module.exports = async () => {
  await dropDatabase()
  await disconnectDatabase()
  console.log(`[JestGlobalTeardown] Test successfully ended!`)
  process.exit(0)
}
