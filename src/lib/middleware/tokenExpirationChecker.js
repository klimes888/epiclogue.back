import { cookieOption } from '../../options/options'
import { generateToken } from '../tokenManager'

export const tokenExpirationChecker = async (req, res, next) => {
  if (Date.now() / 1000 - req.user.iat > 3600) {
    const newToken = await generateToken(req.user.nick, req.user.uid, req.user.isConfirmed)
    res.cookie('access_token', newToken, cookieOption)
  }

  // 이후 서비스 로직 실행
  next()
}
