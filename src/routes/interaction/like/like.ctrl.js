import createError from 'http-errors';
import { likeDAO, reactDAO, userDAO, notificationDAO } from '../../../DAO'
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

  const { targetInfo, targetType } = req.body;

  try {
    const didLike = await likeDAO.didLike(likeData);

    if (didLike) {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 이미 좋아요 한 ${likeData.targetType}:${targetInfo} 에 좋아요를 요청했습니다.`
      );
      return next(createError(400, '이미 처리된 데이터입니다.'));
    }
    const {likeCount, targetData} = await likeDAO.like(likeData, targetInfo, targetType, res.locals.uid)
    /* 자기 자신에게는 알림을 보내지 않음 */
    if (targetData.writer.toString() !== res.locals.uid) {
      await notificationDAO.makeNotification(
        {
          targetUserId: targetData.writer,
          maker: res.locals.uid,
          notificationType: 'Like',
          targetType,
          targetInfo,
        }
      );
    }
    console.log(`[INFO] 유저 ${res.locals.uid}가 ${targetType}: ${targetInfo}를 좋아합니다.`);
    return res.status(201).json({
      result: 'ok',
      data: { heartCount: likeCount },
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
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

  try {
    const didLike = await likeDAO.didLike(likeData);

    if (!didLike) {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 좋아요 하지 않은 ${targetType}:${targetInfo}에 대해 좋아요를 해제하려 했습니다.`
      );
      return next(createError(400, '이미 처리된 데이터입니다.'));
    }
    const likeCount = await likeDAO.unlike(likeData, targetInfo, targetType)
    if (targetType === 'Board') {
      await reactDAO.deleteReact(likeData.userId, targetInfo)
    }
    console.log(
      `[INFO] 유저 ${res.locals.uid}가 ${targetType}: ${targetInfo}의 좋아요를 해제했습니다.`
    );
    return res.status(200).json({
      result: 'ok',
      data: { heartCount: likeCount },
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
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
    const userId = await userDAO.getIdByScreenId(screenId);
    const likeObjectIdList = await likeDAO.getByUserId(userId, targetType);

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
