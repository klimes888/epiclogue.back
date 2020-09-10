import Database from '../../src/lib/database'

module.exports = async () => {
  await Database.disconnect()
}