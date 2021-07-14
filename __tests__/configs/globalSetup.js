import { connectDatabase } from '../../src/lib/database'

module.exports = async () => {
  await connectDatabase()
}
