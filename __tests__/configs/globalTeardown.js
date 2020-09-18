import Database from '../../src/lib/database'

module.exports = async () => {
  await Database.disconnect()
  console.log(`[INFO] Test successfully ended!`)
  process.exit(0)
}
