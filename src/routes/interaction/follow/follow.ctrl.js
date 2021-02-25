import createError from 'http-errors';
import { startSession } from 'mongoose';
import { User, Follow } from '../../../models';
import makeNotification from '../../../lib/makeNotification';
import { contentsWrapper } from '../../../lib/contentsWrapper';

/**
 * @description 팔로우 추가
 * @access POST /interaction/follow
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const addFollow = async (req, res, next) => {
  const followData = {
    userId: res.locals.uid,
    targetUserId: req.body.targetUserId,
  };

  const session = await startSession();

  try {
    const didFollow = await Follow.didFollow(followData);

    if (didFollow) {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 이미 팔로우 한 ${followData.targetUserId} 에 팔로우를 요청했습니다.`
      );
      return next(createError(400, '이미 처리된 데이터입니다.'));
    }

    await session.withTransaction(async () => {
      const followSchema = new Follow(followData);
      await followSchema.save({ session });
      await makeNotification(
        {
          targetUserId: req.body.targetUserId,
          maker: res.locals.uid,
          notificationType: 'Follow',
          targetType: 'User',
          targetInfo: res.locals.uid,
        },
        session
      );

      const followCount = await Follow.countDocuments({
        targetUserId: req.body.targetUserId,
      }).session(session);

      console.log(`[INFO] 유저 ${res.locals.uid}가 ${followData.targetUserId}를 팔로우합니다.`);
      return res.status(201).json({
        result: 'ok',
        data: { followCount },
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
 * @description 팔로우 취소
 * @access DELETE /interaction/follow
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const deleteFollow = async (req, res, next) => {
  const followData = {
    userId: res.locals.uid,
    targetUserId: req.body.targetUserId,
  };

  const session = await startSession();

  try {
    const didFollow = await Follow.didFollow(followData);

    if (!didFollow) {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 팔로우 하지않은 ${followData.targetUserId} 에 팔로우를 요청했습니다.`
      );
      return next(createError(400, '이미 처리된 데이터입니다.'));
    }

    await session.withTransaction(async () => {
      const unfollow = await Follow.unfollow(followData).session(session);

      if (unfollow.ok === 1) {
        const followCount = await Follow.countDocuments({
          targetUserId: req.body.targetUserId,
        }).session(session);
        console.log(
          `[INFO] 유저 ${res.locals.uid}가 ${followData.targetUserId}를 언팔로우했습니다.`
        );
        return res.status(200).json({
          result: 'ok',
          data: { followCount },
        });
      }
      if (unfollow.ok === 0) {
        console.error(
          `[ERROR] 유저 ${res.locals.uid}가 ${followData.targetUserId}에게 한 언팔로우가 실패했습니다: 데이터베이스 질의에 실패했습니다.`
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

/**
 * @description 팔로잉/팔로워 리스트 확인
 * @access GET /interaction/follow?screenId={SCREENID}&type=[following/follower]
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 팔로잉 또는 팔로워 리스트
 */
export const getFollow = async (req, res, next) => {
  const { screenId } = req.query;
  const userId = await User.getIdByScreenId(screenId);
  const { type } = req.query;

  try {
    const requestedData =
      type === 'following'
        ? await Follow.getFollowingList(userId._id)
        : await Follow.getFollowerList(userId._id);

    const wrappedFollowData = await contentsWrapper(
      res.locals?.uid,
      requestedData,
      'Follow',
      false
    );

    console.log(
      `[INFO] 유저 ${res.locals.uid || '비회원 유저'} 가 ${
        userId._id
      } 의 ${type} 리스트를 확인합니다.`
    );
    return res.status(200).json({
      result: 'ok',
      data: wrappedFollowData,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};
