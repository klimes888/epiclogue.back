import createError from 'http-errors';
import { User, Board, Follow } from '../../models';
import { getBookmarkList } from '../interaction/bookmark/bookmark.ctrl';
import { contentsWrapper } from '../../lib/contentsWrapper';

/**
 * @description 마이보드 - 유저의 프로필 정보 요청
 * @access GET /myboard/:screenId
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns 마이보드 소유자의 정보
 */
export const getMyboard = async (req, res, next) => {
  const { screenId } = req.params;
  const projectionOpt = {
    _id: 1,
    nickname: 1,
    intro: 1,
    screenId: 1,
    banner: 1,
    profile: 1,
    joinDate: 1,
  };

  const userData = await User.getByScreenId(screenId, projectionOpt);

  try {
    const myBoardData = userData.toJSON();

    myBoardData.followerCount = await Follow.countDocuments({ targetUserId: userData._id });
    myBoardData.followingCount = await Follow.countDocuments({ userId: userData._id });
    console.log(res.locals.uid, userData._id);
    if (res.locals?.uid) {
      myBoardData.isFollowing =
        res.locals.uid === userData._id.toString()
          ? 'me'
          : !!(await Follow.isFollowing(res.locals.uid, userData._id));
    }

    console.log(
      `[INFO] ${res.locals?.uid || '비회원 유저'} 가 @${screenId} 의 마이보드를 열람합니다.`
    );
    return res.status(200).json({
      result: 'ok',
      data: myBoardData,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'));
  }
};

/**
 * @description 모든 작품 확인
 * @access GET /myboard/:screenId/all
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns Array of all works
 */
export const allWorks = async (req, res, next) => {
  const userId = await User.findOne({ screenId: req.params.screenId }, { _id: 1, screenId: 0 });
  try {
    const userAllWorks = await Board.findAll({ writer: userId._id });
    const wrappedWorks = res.locals?.uid
      ? await contentsWrapper(res.locals.uid, userAllWorks, 'Board', false)
      : userAllWorks;

    console.log(`[INFO] ${res.locals.uid || '비회원유저'} 가 ${userId._id} 의 글들을 확인합니다.`);
    return res.status(200).json({
      result: 'ok',
      data: wrappedWorks,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    next(createError(500, '알 수 없는 오류가 발생했습니다.'));
  }
};

/**
 * @description 모든 작품 확인
 * @access GET /myboard/:screenId/originals
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns 유저의 원작물 배열
 */
export const originals = async (req, res, next) => {
  try {
    const targetUser = await User.getIdByScreenId(req.params.screenId);
    const myContents = await Board.findAllOriginOrSecondary(targetUser._id, false);
    const wrappedContents = await contentsWrapper(res.locals.uid, myContents, 'Board', false);

    console.log(
      `[INFO] 유저 ${res.locals.uid || '비회원유저'} 가 유저 ${
        targetUser._id
      } 의 원작들을 확인합니다.`
    );
    return res.status(200).json({
      result: 'ok',
      data: wrappedContents,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};

/**
 * @description 이차창작물 확인
 * @access GET /myboard/:screenId/secondaryWorks
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns 유저의 2차창작물 배열
 */
export const secondaryWorks = async (req, res, next) => {
  try {
    const targetUser = await User.findOne({ screenId: req.params.screenId }, { _id: 1 });
    const userSecondaryWorks = await Board.findAllOriginOrSecondary(targetUser._id, true);
    const wrappedContents = res.locals?.uid
      ? await contentsWrapper(res.locals.uid, userSecondaryWorks, 'Board', false)
      : userSecondaryWorks;

    console.log(
      `[INFO] 유저 ${res.locals.uid || '비회원유저'} 가 유저 ${
        targetUser._id
      } 의 2차창작들을 확인합니다.`
    );
    return res.status(200).json({
      result: 'ok',
      data: wrappedContents,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};

/**
 * @description 북마크 확인
 * @access GET /myboard/:screenId/bookmarks
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns 유저의 북마크 배열
 */
export const bookmarks = (req, res, next) => getBookmarkList(req, res, next);
