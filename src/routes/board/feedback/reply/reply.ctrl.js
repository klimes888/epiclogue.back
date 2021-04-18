import Joi from 'joi'
import { contentsWrapper } from '../../../../lib/contentsWrapper'
import { replyDAO, notificationDAO, feedbackDAO } from '../../../../DAO'
import { apiErrorGenerator } from '../../../../lib/apiErrorGenerator'
import { apiResponser } from '../../../../lib/middleware/apiResponser'

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
    writer: req.user.id,
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
    return next(apiErrorGenerator(400, '입력값이 적절하지 않습니다.', e))
  }

  try {
    const newerReplies = await replyDAO.createAndGetNewList(
      replyForm,
      req.user.id,
      req.params.feedbackId
    )
    const wrappedReplies = await contentsWrapper(req.user.id, newerReplies, 'Reply', false)
    const feedbackData = await feedbackDAO.getWriter(req.params.feedbackId)
    /* 자기 자신에게는 알림을 보내지 않음 */
    if (feedbackData.writer.toString() !== req.user.id) {
      await notificationDAO.makeNotification({
        targetUserId: feedbackData.writer,
        maker: req.user.id,
        notificationType: 'Reply',
        targetType: 'Feedback',
        targetInfo: req.params.feedbackId,
      })
    }

    return apiResponser({ req, res, statusCode: 201, data: wrappedReplies })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
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
    const wrappedReplies = await contentsWrapper(req.user?.uid, replyData, 'Reply', false)

    return apiResponser({ req, res, data: wrappedReplies })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
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
    return next(apiErrorGenerator(400, '입력값이 적절하지 않습니다.', e))
  }

  try {
    const newerData = await replyDAO.updateAndGetNewList(req.params.feedbackId, newForm)
    const wrappedReplies = await contentsWrapper(req.user.id, newerData, 'Reply', false)

    return apiResponser({ req, res, data: wrappedReplies })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
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
    const wrappedReplies = await contentsWrapper(req.user.id, newerReplies, 'Reply', false)

    return apiResponser({ req, res, data: wrappedReplies })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}
