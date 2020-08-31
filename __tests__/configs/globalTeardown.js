import Database from '../../database'

module.exports = async () => {
  await Database.drop()
  await Database.disconnect()
}