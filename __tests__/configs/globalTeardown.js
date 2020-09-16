import Database from '../../src/lib/database'

module.exports = async () => {
  await Database.disconnect()
  console.log('Test successfully ends')
  process.exit(0)
}
