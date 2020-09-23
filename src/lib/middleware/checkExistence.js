import { User, Board, Reply, Feedback } from '../../models'
import createError from 'http-errors'
import Joi from 'joi'

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
    if (req.params.replyId !== undefined || req.body.targetType === 'reply') {
      type = '댓글'
      targetId = req.params.replyId || req.body.targetId
    } else if (req.params.feedbackId !== undefined || req.body.targetType === 'feedback') {
      type = '피드백'
      targetId = req.params.feedbackId || req.body.targetId
    } else {
      // 글 수정 또는 북마크, 좋아요
      type = '글'
      targetId = req.params.boardId || req.body.boardId || req.body.targetId
    }

    try {
      await checkSchema.validateAsync({ targetId, type })
    } catch (e) {
      console.warn(
        `[WARN] 유저 ${res.locals.uid} 가 ${type} ObjectId에 적절하지 않은 값 ${targetId} 길이(${targetId.length}) 를 입력했습니다. ${e}`
      )
      return res.status(400).json({
        result: 'error',
        message: '입력값이 적절하지 않습니다.',
      })
    }

    if (type === '글') {
      existence = await Board.getById(targetId)
    } else if (type === '피드백') {
      existence = await Feedback.getById(targetId)
    } else if (type === '댓글') {
      existence = await Reply.getById(targetId)
    }

    if (existence !== null) {
      next()
    } else {
      console.warn(
        `[WARN] 유저 ${res.locals.uid}가 존재하지 않는 ${type} ${targetId} 를 접근하려 했습니다.`
      )
      next(createError(404, '존재하지 않는 데이터입니다.'))
    }
  } catch (e) {
    console.error(`[ERROR] 게시글 존재 여부를 확인하는 중에 문제가 발생 했습니다. ${e}`)
    return res.status(500).json({
      result: 'error',
      message: '알 수 없는 오류가 발생했습니다.',
    })
  }
}

// for follow, DM, mute, block
export const checkUserExistence = async (req, res, next) => {
  const userId = req.body.targetUserId || (await User.getIdByScreenId(req.params.screenId))

  const userSchema = Joi.object({
    userId: Joi.string()
      .regex(/^[a-fA-F0-9]{24}$/)
      .required(),
  })

  try {
    await userSchema.validateAsync({ userId })
  } catch (e) {
    console.warn(
      `[WARN] 유저 ${res.locals.uid} 가 유저 ObjectId에 적절하지 않은 값 ${userId} 길이(${userId.length}) 를 입력했습니다.`
    )
    return res.status(400).json({
      result: 'error',
      message: '입력값이 적절하지 않습니다.',
    })
  }

  try {
    const existence = await User.getById(userId)

    if (existence !== null) {
      // left is Object, right is String.
      if (existence._id.toString() === res.locals.uid) {
        return res.status(400).json({
          result: 'error',
          message: '적절하지 않은 접근입니다.',
        })
      } else {
        next()
      }
    } else {
      console.warn(
        `[WARN] 유저 ${res.locals.uid}가 존재하지 않는 유저 ${userId} 에게 접근하려 했습니다.`
      )
      next(createError(404, '존재하지 않는 데이터입니다.'))
    }
  } catch (e) {
    console.error(`[ERROR] 유저 존재 여부를 확인하는 중에 문제가 발생 했습니다. ${e}`)
    return res.status(500).json({
      result: 'error',
      message: '알 수 없는 오류가 발생했습니다.',
    })
  }
}

/* guarantee to have 0 or 1 (bookmark, like, follow, mute, block)
 * 0. check type
 * 1. check DB
 * 2. return result
 * */
export const checkUnique = async (req, res, next) => {
  try {
  } catch (e) {
    console.error(`[ERROR] 데이터 유일성을 확인하는 중에 문제가 발생 했습니다. ${e}`)
    return res.status(500).json({
      result: 'error',
      message: '알 수 없는 오류가 발생했습니다.',
    })
  }
}
