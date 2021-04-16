import Joi from 'joi'
import { contentsWrapper } from '../../../lib/contentsWrapper'
import { feedbackDAO, replyDAO, notificationDAO } from '../../../DAO'
import { apiErrorGenerator } from '../../../lib/apiErrorGenerator'
import { apiResponser } from '../../../lib/middleware/apiResponser'

/**
 * @description 피드백 작성
 * @access POST /boards/:boardId/feedback
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 해당 글의 모든 피드백
 */
export const postFeedback = async (req, res, next) => {
  const feedbackData = {
    writer: res.locals.uid,
    boardId: req.params.boardId,
    feedbackBody: req.body.feedbackBody,
  }

  const feedbackValidateSchema = Joi.object({
    feedbackBody: Joi.string().trim().required(),
  })

  try {
    await feedbackValidateSchema.validateAsync({
      feedbackBody: feedbackData.feedbackBody,
    })
  } catch (e) {
    return next(apiErrorGenerator(400, '입력값이 적절하지 않습니다.', e))
  }

  try {
    const {
      postFeedbackResult,
      newerFeedbacks,
      targetData,
    } = await feedbackDAO.createAndGetNewList(req.params.boardId, feedbackData)
    /* 자신에게는 알림을 보내지 않음 */
    if (res.locals.uid !== targetData.writer.toString()) {
      await notificationDAO.makeNotification({
        targetUserId: targetData.writer,
        maker: res.locals.uid,
        notificationType: 'Feedback',
        targetType: 'Board',
        targetInfo: req.params.boardId,
      })
    }

    const wrappedFeedbacks = await contentsWrapper(
      res.locals.uid,
      newerFeedbacks,
      'Feedback',
      false
    )

    return apiResponser({ req, res, statusCode: 201, data: wrappedFeedbacks })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}

/**
 * @description 피드백 수정
 * @access PATCH /boards/:boardId/feedback/:feedbackId
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 해당 글의 모든 피드백
 */
export const editFeedback = async (req, res, next) => {
  const newForm = {
    feedbackId: req.params.feedbackId,
    newFeedbackBody: req.body.newFeedbackBody,
  }

  const feedbackSchema = Joi.object({
    newFeedbackBody: Joi.string().trim().required(),
  })

  try {
    await feedbackSchema.validateAsync({
      newFeedbackBody: newForm.newFeedbackBody,
    })
  } catch (e) {
    return next(apiErrorGenerator(400, '입력값이 적절하지 않습니다.', e))
  }

  try {
    const newerFeedbacks = await feedbackDAO.updateAndGetNewList(req.params.boardId, newForm)
    const wrappedFeedbacks = await contentsWrapper(
      res.locals.uid,
      newerFeedbacks,
      'Feedback',
      false
    )

    return apiResponser({ req, res, data: wrappedFeedbacks })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}

/**
 * @description 피드백 삭제
 * @access DELETE /boards/:boardId/feedback/:feedbackId
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 해당 글의 모든 피드백
 */
export const deleteFeedback = async (req, res, next) => {
  try {
    const newerFeedbacks = await feedbackDAO.deleteFeedbackAndGetNewList(
      req.params.feedbackId,
      req.params.boardId
    )
    const wrappedFeedbacks = await contentsWrapper(
      res.locals.uid,
      newerFeedbacks,
      'Feedback',
      false
    )
    replyDAO.deleteByParentId(req.params.feedbackId)

    return apiResponser({ req, res, data: wrappedFeedbacks })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}

/**
 * @description 피드백 조회(테스트)
 * @access GET /boards/:boardId/feedback/:feedbackId
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 요청한 피드백 데이터
 */
export const getFeedback = async (req, res, next) => {
  try {
    const feedbackData = await feedbackDAO.getById(req.params.feedbackId)

    return apiResponser({ req, res, data: feedbackData })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}
