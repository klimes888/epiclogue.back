import createError from 'http-errors';
import { startSession } from 'mongoose';
import { Like, React, Board, Feedback, Reply, User } from '../../../models';
import makeNotification from '../../../lib/makeNotification';

/**
 * @description 좋아요 추가
 * @access POST /interaction/like
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const addLike = async (req, res, next) => {
  const likeData = {
    userId: res.locals.uid,
    targetType: req.body.targetType,
    targetInfo: req.body.targetInfo,
  };

  const { targetInfo, targetType } = req.body; // remove
  const session = await startSession();

  try {
    const didLike = await Like.didLike(likeData);

    if (didLike) {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 이미 좋아요 한 ${likeData.targetType}:${targetInfo} 에 좋아요를 요청했습니다.`
      );
      return next(createError(400, '이미 처리된 데이터입니다.'));
    }

    await session.withTransaction(async () => { // session function must change direct use model to dao
      await new Like(likeData).save({ session });

      const likeCount = await Like.countDocuments({ targetInfo, targetType }).session(session);
      let targetData;

      if (targetType === 'Board') {
        const reactSchema = new React({
          user: res.locals.uid,
          boardId: req.body.targetInfo,
          type: 'like',
        });

        await reactSchema.save({ session });

        targetData = await Board.findOne({ _id: req.body.targetInfo }, { writer: 1 });
      } else if (targetType === 'Feedback') {
        targetData = await Feedback.findOne({ _id: req.body.targetInfo }, { writer: 1 });
      } else if (targetType === 'Reply') {
        targetData = await Reply.findOne({ _id: req.body.targetInfo }, { writer: 1 });
      }

      /* 자기 자신에게는 알림을 보내지 않음 */
      if (targetData.writer.toString() !== res.locals.uid) {
        await makeNotification(
          {
            targetUserId: targetData.writer,
            maker: res.locals.uid,
            notificationType: 'Like',
            targetType,
            targetInfo,
          },
          session
        );
      }
      console.log(`[INFO] 유저 ${res.locals.uid}가 ${targetType}: ${targetInfo}를 좋아합니다.`);
      return res.status(201).json({
        result: 'ok',
        data: { heartCount: likeCount },
      });
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  } finally {
    session.endSession();
  }
};

/**
 * @description 좋아요 취소
 * @access DELETE /interaction/like
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const deleteLike = async (req, res, next) => {
  const likeData = {
    userId: res.locals.uid,
    targetInfo: req.body.targetInfo,
    targetType: req.body.targetType,
  };

  const { targetInfo, targetType } = req.body;
  const session = await startSession();

  try {
    const didLike = await Like.didLike(likeData);

    if (!didLike) {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 좋아요 하지 않은 ${targetType}:${targetInfo}에 대해 좋아요를 해제하려 했습니다.`
      );
      return next(createError(400, '이미 처리된 데이터입니다.'));
    }

    await session.withTransaction(async () => { // session function must change direct use model to dao
      await Like.unlike(likeData).session(session);

      const likeCount = await Like.countDocuments({ targetInfo, targetType }).session(session);

      if (targetType === 'Board') {
        await React.delete(likeData.userId, targetInfo).session(session);
      }

      console.log(
        `[INFO] 유저 ${res.locals.uid}가 ${targetType}: ${targetInfo}의 좋아요를 해제했습니다.`
      );
      return res.status(200).json({
        result: 'ok',
        data: { heartCount: likeCount },
      });
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  } finally {
    session.endSession();
  }
};

/**
 * @description 좋아요 리스트 확인
 * @access GET /interaction/like?screenId={SCREENID}&type=[Board, Feedback, Reply]
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const getLikeList = async (req, res, next) => {
  const { screenId } = req.query;
  const { type: targetType } = req.query;

  try {
    const userId = await User.getIdByScreenId(screenId);
    const likeObjectIdList = await Like.getByUserId(userId, targetType);

    console.log(`[INFO] 유저 ${res.locals.uid}가 유저 ${userId} 의 좋아요 리스트를 확인했습니다.`);
    return res.status(200).json({
      result: 'ok',
      data: likeObjectIdList,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};
