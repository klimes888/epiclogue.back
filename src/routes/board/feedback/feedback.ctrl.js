import Joi from 'joi'
import createError from 'http-errors'
import { contentsWrapper } from '../../../lib/contentsWrapper'
import { feedbackDAO, replyDAO, notificationDAO } from '../../../DAO'

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
  };

  const feedbackValidateSchema = Joi.object({
    feedbackBody: Joi.string().trim().required(),
  });

  try {
    await feedbackValidateSchema.validateAsync({
      feedbackBody: feedbackData.feedbackBody,
    });
  } catch (e) {
    console.log(
      `[INFO] 유저 ${res.locals.uid} 가 피드백 작성 중 적절하지 않은 데이터를 입력했습니다. ${e}`
    );
    return next(createError(400, '입력값이 적절하지 않습니다.'));
  }

  try {
    const {postFeedbackResult, newerFeedbacks, targetData} = await feedbackDAO.createAndGetNewList(req.params.boardId, feedbackData)
    /* 자신에게는 알림을 보내지 않음 */
    if (res.locals.uid !== targetData.writer.toString()) {
      await notificationDAO.makeNotification({
          targetUserId: targetData.writer,
          maker: res.locals.uid,
          notificationType: 'Feedback',
          targetType: 'Board',
          targetInfo: req.params.boardId,
      });
    }
    console.log(
      `[INFO] 유저 ${res.locals.uid} 가 피드백 ${postFeedbackResult._id} 을 작성했습니다.`
    );
    const wrappedFeedbacks = await contentsWrapper(
      res.locals.uid,
      newerFeedbacks,
      'Feedback',
      false
    );

    return res.status(201).json({
      result: 'ok',
      data: wrappedFeedbacks,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};

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
  };

  const feedbackSchema = Joi.object({
    newFeedbackBody: Joi.string().trim().required(),
  });

  try {
    await feedbackSchema.validateAsync({
      newFeedbackBody: newForm.newFeedbackBody,
    });
  } catch (e) {
    console.log(
      `[INFO] 유저 ${res.locals.uid} 가 피드백 작성 중 적절하지 않은 데이터를 입력했습니다. ${e}`
    );
    return next(createError(400, '입력값이 적절하지 않습니다.'));
  }

  try {
    const newerFeedbacks = await feedbackDAO.updateAndGetNewList(req.params.boardId, newForm)
    const wrappedFeedbacks = await contentsWrapper(
      res.locals.uid,
      newerFeedbacks,
      'Feedback',
      false
    );
    console.log(`[INFO] 피드백 ${req.params.feedbackId} 가 정상적으로 수정되었습니다.`);
    return res.status(200).json({
      result: 'ok',
      data: wrappedFeedbacks,
    });

  } catch (e) {
    console.error(
      `[ERROR] 피드백 ${req.params.feedbackId} 의 수정이 정상적으로 처리되지 않았습니다: 데이터베이스 질의에 실패했습니다.`
    );
    console.error(`[ERROR] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};

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
    const newerFeedbacks = await feedbackDAO.deleteFeedbackAndGetNewList(req.params.feedbackId, req.params.boardId)
    const wrappedFeedbacks = await contentsWrapper(
      res.locals.uid,
      newerFeedbacks,
      'Feedback',
      false
    )
    console.log(`[INFO] 피드백 ${req.params.feedbackId} 가 정상적으로 삭제되었습니다.`)
    replyDAO.deleteByParentId(req.params.feedbackId)
    return res.status(200).json({
      result: 'ok',
      data: wrappedFeedbacks,
    });
  } catch (e) {
    console.error(
      `[ERROR] 피드백 ${req.params.feedbackId} 의 삭제가 정상적으로 처리되지 않았습니다: 데이터베이스 질의에 실패했습니다.`
    );
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};

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
    const feedbackData = await feedbackDAO.getById(req.params.feedbackId);
    console.log(
      `[INFO] 유저 ${feedbackData.writer} 가 피드백 ${feedbackData._id} 를 조회했습니다.`
    );
    return res.status(200).json({
      result: 'ok',
      data: feedbackData,
    });
  } catch (e) {
    console.log(`[ERROR] ${e.message}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};
