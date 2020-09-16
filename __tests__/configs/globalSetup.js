import Database from '../../src/lib/database'
import { Connection } from 'mongoose'
import child_process from 'child_process'

module.exports = async () => {
  if (Connection.readyState !== 1) {
    console.log(`[FATAL] Database is not servicing or disconnected`)
    child_process.exec('sudo service mongodb start', (err, stdout, stderr) => {
      if (err) {
        console.error(`There's error with starting database ${err}`)
        console.error(stderr)
        process.exit(1)
      }
      console.log(stdout)
    })
  }

  await Database.connect()
  await Database.drop()
}
