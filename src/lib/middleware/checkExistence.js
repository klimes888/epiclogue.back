import Joi from 'joi'
import { userDAO, boardDAO, replyDAO, feedbackDAO } from '../../DAO'
import { apiErrorGenerator } from '../apiErrorGenerator'

// to patch, delete, like, bookmark on board, feedback, reply
export const checkExistence = async (req, res, next) => {
  let type
  let targetId
  let existence

  const checkSchema = Joi.object({
    targetId: Joi.string()
      .regex(/^[a-fA-F0-9]{24}$/)
      .required(),
    type: Joi.string().required(),
  })

  try {
    // 게시 타입에 따라 분류 후 처리
    if (req.params.replyId !== undefined || req.body.targetType === 'Reply') {
      type = '댓글'
      targetId = req.params.replyId || req.body.targetInfo
    } else if (req.params.feedbackId !== undefined || req.body.targetType === 'Feedback') {
      type = '피드백'
      targetId = req.params.feedbackId || req.body.targetInfo
    } else {
      // 글 수정 또는 북마크, 좋아요
      type = '글'
      targetId = req.params.boardId || req.body.boardId || req.body.targetInfo
    }

    try {
      await checkSchema.validateAsync({ targetId, type })
    } catch (e) {
      return next(apiErrorGenerator(400, '입력값이 적절하지 않습니다.', e))
    }

    if (type === '글') {
      existence = await boardDAO.getById(targetId)
    } else if (type === '피드백') {
      existence = await feedbackDAO.getById(targetId)
    } else if (type === '댓글') {
      existence = await replyDAO.getById(targetId)
    }

    if (existence !== null) {
      next()
    } else {
      return next(apiErrorGenerator(404, '존재하지 않는 데이터입니다.'))
    }
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 오류가 발생했습니다.', e))
  }
}

// for follow, DM, mute, block
export const checkUserExistence = async (req, res, next) => {
  const userId = req.body.targetUserId

  if (userId === undefined) {
    // query: follow, params: myboard
    const screenId = req.query.screenId || req.params.screenId
    const userCheck = await userDAO.findByScreenId(screenId)

    if (userCheck && userCheck.deactivatedAt === null) {
      return next()
    }
    return next(apiErrorGenerator(404, '존재하지 않는 screenId를 입력했습니다.'))
  }

  const userSchema = Joi.object({
    userId: Joi.string()
      .regex(/^[a-fA-F0-9]{24}$/)
      .required(),
  })

  try {
    await userSchema.validateAsync({ userId })
  } catch (e) {
    return next(apiErrorGenerator(400, '입력값이 적절하지 않습니다.', e))
  }

  try {
    const existence = await userDAO.getById(userId)

    if (existence && existence.deactivatedAt === null) {
      // left is Object, right is String.
      if (existence._id.toString() === res.locals.uid) {
        return next(apiErrorGenerator(400, '입력값이 적절하지 않습니다.'))
      }
      next()
    } else {
      return next(apiErrorGenerator(404, '존재하지 않거나 탈퇴한 유저입니다.'))
    }
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 오류가 발생했습니다.', e))
  }
}
