import { connectDatabase, dropDatabase } from '../../src/lib/database'

module.exports = async () => {
  // console.log(`mongodb: ${Connection.readyState}`) // normally got 'undefined' while mongodb is running
  /* MongoDB가 servicing이 아닐 때 시작시켜주는 코드입니다. 다만 db health check가 적절하지 않아 매번 동작하므로 리팩토링이 필요합니다. */
  // if (Connection.readyState !== 1) {
  //   console.log(`[FATAL] Database is not servicing or disconnected`)
  //   child_process.exec('sudo service mongodb start', (err, stdout, stderr) => {
  //     if (err) {
  //       console.error(`There's error with starting database ${err}`)
  //       console.error(stderr)
  //       process.exit(1)
  //     }
  //     console.log(stdout)
  //   })
  // }

  await connectDatabase()
  await dropDatabase()
}
