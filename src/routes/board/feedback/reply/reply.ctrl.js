import Joi from 'joi'
import createError from 'http-errors'
import { contentsWrapper } from '../../../../lib/contentsWrapper'
import { replyDAO, notificationDAO, feedbackDAO } from '../../../../DAO'

/**
 * @description 대댓글 작성
 * @access POST /boards/:boardId/feedback/:feedbackId/reply
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 해당 댓글의 모든 대댓글 리스트
 */
export const postReply = async (req, res, next) => {
  const replyForm = {
    writer: res.locals.uid,
    boardId: req.params.boardId,
    parentId: req.params.feedbackId,
    replyBody: req.body.replyBody,
  }

  const replyValidateSchema = Joi.object({
    replyBody: Joi.string().trim().required(),
  })

  try {
    await replyValidateSchema.validateAsync({
      replyBody: replyForm.replyBody,
    })
  } catch (e) {
    console.log(
      `[INFO] 유저 ${res.locals.uid} 가 적절하지 않은 데이터로 댓글을 작성하려 했습니다. ${e}`
    )
    return next(createError(400, '입력값이 적절하지 않습니다.'))
  }

  try {
    const { replyData, newerReplies } = await replyDAO.createAndGetNewList(
      replyForm,
      res.locals.uid,
      req.params.feedbackId
    )
    const wrappedReplies = await contentsWrapper(res.locals.uid, newerReplies, 'Reply', false)
    const feedbackData = await feedbackDAO.getWriter(req.params.feedbackId)
    /* 자기 자신에게는 알림을 보내지 않음 */
    if (feedbackData.writer.toString() !== res.locals.uid) {
      await notificationDAO.makeNotification({
        targetUserId: feedbackData.writer,
        maker: res.locals.uid,
        notificationType: 'Reply',
        targetType: 'Feedback',
        targetInfo: req.params.feedbackId,
      })
    }

    console.log(`[INFO] 유저 ${res.locals.uid} 가 댓글 ${replyData._id} 를 작성했습니다.`)
    return res.status(201).json({
      result: 'ok',
      data: wrappedReplies,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

/**
 * @description 대댓글 열람
 * @access GET /boards/:boardId/feedback/:feedbackId/reply
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 해당 댓글의 모든 대댓글 리스트
 */
export const getReplys = async (req, res, next) => {
  const { feedbackId } = req.params

  try {
    const replyData = await replyDAO.getByParentId(feedbackId)
    const wrappedReplies = await contentsWrapper(res.locals?.uid, replyData, 'Reply', false)

    console.log(
      `[INFO] 유저 ${
        res.locals.uid || '비회원유저'
      } 가 피드백 ${feedbackId} 하위의 댓글(들)을 열람합니다.`
    )
    return res.status(200).json({
      result: 'ok',
      data: wrappedReplies,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

/**
 * @description 대댓글 수정
 * @access PATCH /boards/:boardId/feedback/:feedbackId/reply/:replyId
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 해당 댓글의 모든 대댓글 리스트
 */
export const editReply = async (req, res, next) => {
  const newForm = {
    replyId: req.params.replyId,
    newReplyBody: req.body.newReplyBody,
  }

  const replyValidateSchema = Joi.object({
    newReplyBody: Joi.string().trim().required(),
  })

  try {
    await replyValidateSchema.validateAsync({
      newReplyBody: newForm.newReplyBody,
    })
  } catch (e) {
    console.log(
      `[INFO] 유저 ${res.locals.uid} 가 적절하지 않은 데이터로 댓글을 작성하려 했습니다. ${e}`
    )
    return next(createError(400, '입력값이 적절하지 않습니다.'))
  }

  try {
    const newerData = await replyDAO.updateAndGetNewList(req.params.feedbackId, newForm)
    const wrappedReplies = await contentsWrapper(res.locals.uid, newerData, 'Reply', false)
    console.log(`[INFO] 유저 ${res.locals.uid} 가 댓글 ${req.params.replyId} 을 수정했습니다.`)
    return res.status(200).json({
      result: 'ok',
      data: wrappedReplies,
    })
  } catch (e) {
    console.log(
      `[INFO] 유저 ${res.locals.uid}가 댓글 ${req.params.replyId} 의 수정을 시도했으나 실패했습니다.`
    )
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

/**
 * @description 대댓글 삭제
 * @access DELETE /boards/:boardId/feedback/:feedbackId/reply/:replyId
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 해당 댓글의 모든 대댓글 리스트
 */
export const deleteReply = async (req, res, next) => {
  try {
    const newerReplies = await replyDAO.deleteReplyAndGetNewList(
      req.params.replyId,
      req.params.feedbackId
    )
    const wrappedReplies = await contentsWrapper(res.locals.uid, newerReplies, 'Reply', false)
    console.log(`[INFO] 유저 ${res.locals.uid} 가 댓글 ${req.params.replyId} 을 삭제했습니다.`)
    return res.status(200).json({
      result: 'ok',
      data: wrappedReplies,
    })
  } catch (e) {
    console.error(
      `[Error] 데이터베이스 질의에 실패했습니다: ${req.params.replyId} 의 삭제를 시도했으나 존재하지 않습니다.`
    )
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}
