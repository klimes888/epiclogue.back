import Database from '../../src/lib/database'

module.exports = async () => {
  await Database.connect()
  await Database.drop()
}
