import crypto from 'crypto'
import util from 'util'
import '../env/env'

const randomBytesPromise = util.promisify(crypto.randomBytes)

export const joinDataCrypt = async (id, pass) => {
  const screenId = crypto.createHash('sha256').update(id).digest('hex').slice(0, 14)
  const salt = await getRandomString()
  const password = crypto.pbkdf2Sync(
    pass,
    salt,
    parseInt(process.env.EXEC_NUM, 10),
    parseInt(process.env.RESULT_LENGTH, 10),
    'sha512'
  )
  const token = password.toString('hex').slice(0, 24)

  return {
    screenId,
    salt,
    password: password.toString('base64'),
    token,
  }
}

export const cryptoData = async (data, salt) =>
  crypto
    .pbkdf2Sync(
      data,
      salt,
      parseInt(process.env.EXEC_NUM, 10),
      parseInt(process.env.RESULT_LENGTH, 10),
      'sha512'
    )
    .toString('base64')

export const getRandomString = async () => {
  const result = await randomBytesPromise(64)
  return result.toString('base64')
}

export const getRandomToken = async () => {
  const result = await randomBytesPromise(24)
  return result.toString('hex')
}
