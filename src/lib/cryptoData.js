import crypto from 'crypto';
import 'dotend/config'
import util from 'util'

const randomBytesPromise = util.promisify(crypto.randomBytes)

export const joinDataCrypt = (id, pass) => {
    const screenId = crypto
                        .createHash('sha256')
                        .update(id)
                        .digest('hex')
                        .slice(0, 14);
    const salt = await randomBytesPromise(64);
    const password = crypto.pbkdf2Sync(
        pass,
        salt.toString('base64'),
        parseInt(process.env.EXEC_NUM, 10),
        parseInt(process.env.RESULT_LENGTH, 10),
        'sha512'
    );
  const token = password.toString('hex').slice(0, 24);

  return {
      screenId,
      salt: salt.toString('base64'),
      password: password.toString('base64'),
      token
  }
}