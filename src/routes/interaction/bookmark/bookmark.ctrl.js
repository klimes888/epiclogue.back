import createError from 'http-errors';
import { startSession } from 'mongoose';
import { Bookmark, React, Board, User } from '../../../models';
import { contentsWrapper } from '../../../lib/contentsWrapper';
import makeNotification from '../../../lib/makeNotification';

/**
 * @description 유저 북마크 리스트 확인
 * @access /interaction/bookmark?screenId={SCREEN_ID}
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 유저의 북마크 리스트
 */
export const getBookmarkList = async (req, res, next) => {
  // To use this code on /myboard/:screenId/bookmarks
  const screenId = req.query.screenId || req.params.screenId;

  try {
    const userInfo = await User.getIdByScreenId(screenId);
    const bookmarkSet = await Bookmark.getByUserId(userInfo._id);
    const extractionSet = bookmarkSet.filter(each => each.board !== null).map(each => each.board);
    const wrappedBookmarks = res.locals?.uid
      ? await contentsWrapper(res.locals.uid, extractionSet, 'Board', false)
      : extractionSet;
    console.log(
      `[INFO] 유저 ${res.locals.uid || '비회원유저'}가 ${
        userInfo._id
      }의 북마크 리스트를 확인했습니다.`
    );
    return res.status(200).json({
      result: 'ok',
      data: wrappedBookmarks,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};

/**
 * @description 북마크 추가
 * @access POST /interaction/bookmark
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 글 북마크 수
 */
export const addBookmark = async function (req, res, next) {
  const bookmarkSchema = new Bookmark({
    user: res.locals.uid,
    board: req.body.boardId,
  });

  const reactSchema = new React({
    user: res.locals.uid,
    boardId: req.body.boardId,
    type: 'bookmark',
  });

  const session = await startSession();

  try {
    const didBookmark = await Bookmark.didBookmark(res.locals.uid, req.body.boardId);

    if (didBookmark) {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 이미 북마크한 글 ${req.body.boardId} 에 북마크를 시도했습니다.`
      );
      return next(createError(400, '입력값이 적절하지 않습니다.'));
    }

    const targetData = await Board.findOne({ _id: req.body.boardId }, { writer: 1 });

    await session.withTransaction(async () => {
      await bookmarkSchema.save({ session });
      await reactSchema.save({ session });

      const bookmarkCount = await Bookmark.countDocuments({ board: req.body.boardId }).session(
        session
      );

      // Make notification if requester is not a writer
      if (targetData.writer.toString() !== res.locals.uid) {
        await makeNotification(
          {
            targetUserId: targetData.writer,
            maker: res.locals.uid,
            notificationType: 'Bookmark',
            targetType: 'Board',
            targetInfo: req.body.boardId,
          },
          session
        );
      }

      console.log(`[INFO] 유저 ${res.locals.uid}가 북마크에 ${req.body.boardId}를 추가했습니다.`);
      return res.status(201).json({
        result: 'ok',
        data: { bookmarkCount },
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
 * @description 북마크 삭제
 * @access DELETE /interaction/bookmark
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 글 북마크 수
 */
export const deleteBookmark = async (req, res, next) => {
  const userId = res.locals.uid;
  const { boardId } = req.body;
  const session = await startSession();

  try {
    const didBookmark = await Bookmark.didBookmark(res.locals.uid, req.body.boardId);

    if (!didBookmark) {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 북마크 하지 않은 글 ${req.body.boardId} 에 북마크 해제를 시도했습니다.`
      );
      return next(createError(400, '입력값이 적절하지 않습니다.'));
    }

    await session.withTransaction(async () => {
      await Bookmark.delete(userId, boardId).session(session);
      await React.delete(userId, boardId).session(session);

      const bookmarkCount = await Bookmark.countDocuments({ board: boardId }).session(session);

      console.log(`[INFO] 유저 ${res.locals.uid}가 북마크에 ${req.body.boardId}를 해제했습니다.`);
      return res.status(200).json({
        result: 'ok',
        data: { bookmarkCount },
      });
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  } finally {
    session.endSession();
  }
};
