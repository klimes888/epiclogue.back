import { boardDAO, replyDAO, feedbackDAO, userDAO } from '../../DAO'
import { apiErrorGenerator } from '../apiErrorGenerator'
import { apiResponser } from './apiResponser'
// 작성자에 대한 인증 미들웨어
export const checkWriter = async (req, res, next) => {
  let isWriter = null
  let type
  let id

  try {
    // 검사 전에 해당 게시물(댓글, 피드백, 글)이 존재하는지 먼저 검사하지 않으면 auth error 발생
    if (req.params.replyId !== undefined) {
      type = '댓글'
      id = req.params.replyId
      isWriter = await replyDAO.isWriter(req.user.id, req.params.replyId)
    } else if (req.params.feedbackId !== undefined) {
      type = '피드백'
      id = req.params.feedbackId
      isWriter = await feedbackDAO.isWriter(req.user.id, req.params.feedbackId)
    } else if (req.params.boardId !== undefined) {
      type = '글'
      id = req.params.boardId
      isWriter = await boardDAO.isWriter(req.user.id, req.params.boardId)
    }

    if (isWriter !== null) {
      next()
    } else {
      return next(apiErrorGenerator(401, `유저 ${req.user.id}는 ${type} ${id}작성자가 아닙니다.`))
    }
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}

export const checkAdmin = (checkPass) => async (req, res, next) => {
    const isAdmin = await userDAO.isAdmin(req.user.id)
    if (isAdmin || checkPass) {
      return next()
    } 
    return apiResponser(req,res,401,null,'you are not admin!')
  }
