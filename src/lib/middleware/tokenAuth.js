import dotenv from 'dotenv'
import createError from 'http-errors'
import jwt from 'jsonwebtoken'
import Joi from 'joi'

dotenv.config()

const SECRET_KEY = process.env.SECRET_KEY

// JWT 기반 유저 인증 미들웨어
export const verifyToken = async (req, res, next) => {
  try {
    const clientToken = req.headers['x-access-token']

    const tokenSchema = Joi.object({
      token: Joi.string().regex(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/).required()
    })

    try {
      await tokenSchema.validateAsync({ token: clientToken })
    } catch (e) {
      console.log(`[INFO] 인증 실패: 유저의 토큰이 누락되었거나 적절하지 않습니다. ip: ${req.headers['x-forwarded-for'] ||  req.connection.remoteAddress} token: ${clientToken}`)
      return next(createError(401, '인증 실패: 적절하지 않은 인증입니다.'))
    }

    let decoded
    
    try {
      decoded = await jwt.verify(clientToken, SECRET_KEY)
    } catch (e) {
      console.log(`[INFO] 인증 실패: 손상된 토큰을 사용하였습니다. ip: ${req.headers['x-forwarded-for'] ||  req.connection.remoteAddress} token: ${clientToken}`)
      return next(createError(401, '인증 실패: 적절하지 않은 인증입니다.'))
    }

    if (decoded) {
      if (decoded.isConfirmed) {
        res.locals.uid = decoded.uid
        next()
      } else {
        console.log(`[INFO] 인증 실패: 유저 ${decoded.uid} 가 로그인을 시도했으나 이메일 인증이 완료되지 않았습니다.`)
        return next(createError(401, '이메일 인증이 완료되지 않았습니다.'))
      }
    } else {
      console.log(`[INFO] 인증 실패: 유저 가 로그인을 시도했으나 토큰의 유효기간이 만료되었거나 토큰이 없습니다.`)
      return next(createError(401, '인증 실패: 적절하지 않은 인증입니다.'))
    }
  } catch (e) {
    console.error(`[ERROR] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}
