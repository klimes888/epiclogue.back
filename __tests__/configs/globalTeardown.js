import Database from '../../database'

module.exports = async () => {
  Database.drop()
  Database.disconnect()
}
