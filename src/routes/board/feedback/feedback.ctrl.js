import Joi from 'joi';
import createError from 'http-errors';
import { startSession } from 'mongoose';
import { Board, Feedback } from '../../../models';
import { contentsWrapper } from '../../../lib/contentsWrapper';
import makeNotification from '../../../lib/makeNotification';

/*
  This is feedback router.
  base url: /boards/{boardId}/feedback/{feedbackId}
  OPTIONS: [ GET / POST / PATCH / DELETE ]
*/

export const postFeedback = async (req, res, next) => {
  const feedbackData = {
    writer: res.locals.uid,
    boardId: req.params.boardId,
    feedbackBody: req.body.feedbackBody,
  };

  const feedbackSchema = Joi.object({
    feedbackBody: Joi.string().trim().required(),
  });

  try {
    await feedbackSchema.validateAsync({
      feedbackBody: feedbackData.feedbackBody,
    });
  } catch (e) {
    console.log(
      `[INFO] 유저 ${res.locals.uid} 가 피드백 작성 중 적절하지 않은 데이터를 입력했습니다. ${e}`
    );
    return next(createError(400, '입력값이 적절하지 않습니다.'));
  }

  const session = await startSession();

  try {
    await session.withTransaction(async () => {
      const feedbackSchema = new Feedback(feedbackData);
      const postFeedbackResult = await feedbackSchema.save({ session });
      const targetData = await Board.findOne({ _id: req.params.boardId }, { writer: 1 });
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 피드백 ${postFeedbackResult._id} 을 작성했습니다.`
      );
      await Board.getFeedback(req.params.boardId, postFeedbackResult._id).session(session);
      const newerFeedbacks = await Feedback.getByBoardId(req.params.boardId).session(session);
      const wrappedFeedbacks = await contentsWrapper(
        res.locals.uid,
        newerFeedbacks,
        'Feedback',
        false
      );
      /* 자신에게는 알림을 보내지 않음 */
      if (res.locals.uid !== targetData.writer.toString()) {
        await makeNotification(
          {
            targetUserId: targetData.writer,
            maker: res.locals.uid,
            notificationType: 'Feedback',
            targetType: 'Board',
            targetInfo: req.params.boardId,
          },
          session
        );
      }

      return res.status(201).json({
        result: 'ok',
        data: wrappedFeedbacks,
      });
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  } finally {
    session.endSession();
  }
};

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

  const session = await startSession();

  try {
    await session.withTransaction(async () => {
      // 얘는 왜 .session(session)을 하면 models.Feedbacks.update.session is not a function이 뜰까...
      const patch = await Feedback.update(newForm, session);
      // throw new Error("응애")
      if (patch.ok === 1) {
        const newerFeedbacks = await Feedback.getByBoardId(req.params.boardId).session(session);
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
      }
      console.error(
        `[ERROR] 피드백 ${req.params.feedbackId} 의 수정이 정상적으로 처리되지 않았습니다: 데이터베이스 질의에 실패했습니다.`
      );
      return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  } finally {
    session.endSession();
  }
};

export const deleteFeedback = async (req, res, next) => {
  const session = await startSession();

  try {
    await session.withTransaction(async () => {
      const deletion = await Feedback.delete(req.params.feedbackId).session(session);
      if (deletion.ok === 1) {
        const newerFeedbacks = await Feedback.getByBoardId(req.params.boardId).session(session);
        const wrappedFeedbacks = await contentsWrapper(
          res.locals.uid,
          newerFeedbacks,
          'Feedback',
          false
        );
        console.log(`[INFO] 피드백 ${req.params.feedbackId} 가 정상적으로 삭제되었습니다.`);
        return res.status(200).json({
          result: 'ok',
          data: wrappedFeedbacks,
        });
      }
      if (result.ok === 0) {
        console.error(
          `[ERROR] 피드백 ${req.params.feedbackId} 의 삭제가 정상적으로 처리되지 않았습니다: 데이터베이스 질의에 실패했습니다.`
        );
        return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
      }
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  } finally {
    session.endSession();
  }
};

export const getFeedback = async (req, res, next) => {
  try {
    const feedbackData = await Feedback.getById(req.params.feedbackId);
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
