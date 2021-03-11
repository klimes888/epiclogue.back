import createError from 'http-errors'
import { boardDAO, replyDAO, feedbackDAO, userDAO } from '../../DAO'

// 작성자에 대한 인증 미들웨어
export const checkWriter = async (req, res, next) => {
  let isWriter = null
  let type
  let id

  try {
    // 어드민이면 통과
    const isAdmin = await userDAO.isAdmin(res.locals.uid)
    console.log(res.locals.uid, '의 admin 여부: ', isAdmin)
    if (isAdmin) {
      return next()
    }
    // 검사 전에 해당 게시물(댓글, 피드백, 글)이 존재하는지 먼저 검사하지 않으면 auth error 발생
    if (req.params.replyId !== undefined) {
      type = '댓글'
      id = req.params.replyId
      isWriter = await replyDAO.isWriter(res.locals.uid, req.params.replyId)
    } else if (req.params.feedbackId !== undefined) {
      type = '피드백'
      id = req.params.feedbackId
      isWriter = await feedbackDAO.isWriter(res.locals.uid, req.params.feedbackId)
    } else if (req.params.boardId !== undefined) {
      type = '글'
      id = req.params.boardId
      isWriter = await boardDAO.isWriter(res.locals.uid, req.params.boardId)
    }

    if (isWriter !== null) {
      next()
    } else {
      console.log(`[INFO] 유저 ${res.locals.uid} 가 권한없이 ${type} ${id} 에 접근하려했습니다.`)
      return next(createError(401, `${type} 작성자가 아닙니다.`))
    }
  } catch (e) {
    console.error(`[Error!] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}
