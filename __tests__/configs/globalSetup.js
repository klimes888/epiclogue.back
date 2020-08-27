require('dotenv')
import Database from '../../database'

module.exports = async () => {
  Database.connect()
}