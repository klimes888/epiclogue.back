import Joi from 'joi'
import '../../env/env'
import { cookieOption } from '../../options/options'
import { apiErrorGenerator } from '../apiErrorGenerator'
import { generateToken, verifyToken } from '../tokenManager'

// 예외 페이지들에 대한 route stack의 마지막 async function의 이름을 저장합니다.
const authExceptions = [
  'getBoards', // 메인 페이지
  'viewBoard', // 뷰어 페이지
  'getReplys', // 대댓글 페이지
  'search', // 검색 페이지
  'getMyboard', // 마이보드 페이지
  'bookmarks',
  'secondaryWorks',
  'originals',
  'allWorks', // 마이보드 페이지 끝
  'getReplys', // 대댓글 확인
]

/**
 * @description JWT토큰으로 유저 인증 수행
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS middleware
 */
export const authToken = async (req, res, next) => {
  try {
    const clientToken = req.cookies.access_token

    const { name: accessPath } = req.route.stack[req.route.stack.length - 1]

    if (!clientToken && authExceptions.includes(accessPath)) {
      // 비회원에게 접근이 허용된 페이지
      return next()
    }

    /*
     * 나머지 기능들에 대해 요청받은 토큰을 검사
     * 비회원에게 접근이 허용된 페이지의 경우에는 유저의 로그인 상태에 따라 다르게 보이기 위해 필요
     */

    const tokenSchema = Joi.object({
      token: Joi.string()
        .regex(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
        .required(),
    })

    try {
      await tokenSchema.validateAsync({ token: clientToken })
    } catch (e) {
      return next(apiErrorGenerator(401, '인증 실패: 적절하지 않은 인증입니다.', e))
    }

    let decoded

    try {
      decoded = await verifyToken(clientToken)
    } catch (e) {
      return next(apiErrorGenerator(401, '인증 실패: 적절하지 않은 인증입니다.'))
    }

    if (decoded) {
      if (decoded.isConfirmed) {
        if (Date.now() / 1000 - decoded.iat > 60 * 60 * 24) {
          // 하루이상 지나면 갱신
          const token = await generateToken(decoded.nick, decoded.uid, decoded.isConfirmed)
          res.cookie('access_token', token, cookieOption)
        }
        res.locals.uid = decoded.uid
        next()
      } else {
        return next(apiErrorGenerator(401, '이메일 인증이 완료되지 않았습니다.'))
      }
    } else {
      return next(apiErrorGenerator(401, '인증 실패: 적절하지 않은 인증입니다.'))
    }
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}
