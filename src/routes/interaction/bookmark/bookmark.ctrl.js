import Bookmark from "../../../models/bookmark";
import react from "../../../models/react";
import Board from '../../../models/board'

/* 
  This is bookmark router.
  base url: /:screenId/bookmark
*/

export const getBookmarkList = async (req, res, next) => {
  const screenId = req.params.screenId;

  try {
    const result = await Bookmark.getByUserId(screenId);
    console.log(`[INFO] 유저 ${res.locals.uid}가 ${screenId}의 북마크 리스트를 확인했습니다.`)
    return res.status(200).json(result);
  } catch (e) {
    console.log(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message
    })
  }
};

export const addBookmark = async function (req, res, next) {
  const bookmarkData = {
    userId: res.locals.uid,
    boardId: req.body.boardId,
  };

  const reactData = {
    userId: res.locals.uid,
    boardId: req.body.boardId,
    type: "bookmark"
  }

  try {
    await Bookmark.create(bookmarkData);
    await react.create(reactData);
    await Board.countBookmark(req.body.boardId, 1)
    await Board.countReact(req.body.boardId, 1)
    const bookmarkCount = await Board.getBookmarkCount(req.body.boardId)
    
    console.log(`[INFO] 유저 ${res.locals.uid}가 북마크에 ${req.body.boardId}를 추가했습니다.`)
    
    return res.status(201).json({
      result: 'ok',
      data: bookmarkCount
    })
  } catch (e) {
    console.log(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message
    })
  }
};

export const deleteBookmark = async (req, res, next) => {
  const userId = res.locals.uid;
  const boardId = req.body.boardId;

  try {
    await Bookmark.delete(userId, boardId);
    await react.delete(userId, boardId);
    await Board.countBookmark(req.body.boardId, 0)
    await Board.countReact(req.body.boardId, 0)
    const bookmarkCount = await Board.getBookmarkCount(req.body.boardId)

    console.log(`[INFO] 유저 ${res.locals.uid}가 북마크에 ${req.body.boardId}를 해제했습니다.`)

    return res.status(200).json({
      result: 'ok',
      data: bookmarkCount
    })
  } catch (e) {
    console.log(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message
    })
  }
};