import '../../env/env'
import Joi from 'joi'
import { apiErrorGenerator } from '../apiErrorGenerator'
import { tokenExpirationChecker } from './tokenExpirationChecker'

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
    const clientToken = req.user?.accessToken
    const { name: accessPath } = req.route.stack[req.route.stack.length - 1]

    // 비회원에게 접근이 허용된 페이지
    if (!clientToken && authExceptions.includes(accessPath)) {
      return next()
    }

    // 토큰 형식 확인
    try {
      const tokenSchema = Joi.object({
        token: Joi.string()
          .regex(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
          .required(),
      })
      await tokenSchema.validateAsync({ token: clientToken })
    } catch (e) {
      return next(apiErrorGenerator(401, '인증 실패: 토큰 형식이 아닙니다', e))
    }

    if (req.user) {
      if (req.user.isConfirmed) {
        await tokenExpirationChecker(req, res, next)
      } else {
        return next(apiErrorGenerator(403, '이메일 인증이 완료되지 않았습니다.'))
      }
    } else {
      return next(apiErrorGenerator(401, '인증 실패: 적절하지 않은 인증입니다.'))
    }
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}
