import { Bookmark, React, Board, User } from '../../../models'
import createError from 'http-errors'

/* 
  This is bookmark router.
  base url: /interaction/bookmark[?screenId=lunarcat123]
  OPTIONS: [GET / POST / DELETE]
*/

export const getBookmarkList = async (req, res, next) => {
  const screenId = req.query.screenId

  try {
    const userInfo = await User.getIdByScreenId(screenId)
    const bookmarkSet = await Bookmark.getByUserId(userInfo.screenId)

    console.log(`[INFO] 유저 ${res.locals.uid}가 ${userId._id}의 북마크 리스트를 확인했습니다.`)
    return res.status(200).json({
      result: 'ok',
      data: bookmarkSet,
    })
  } catch (e) {
    console.log(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

export const addBookmark = async function (req, res, next) {
  const bookmarkData = {
    user: res.locals.uid,
    boardId: req.body.boardId,
  }

  const reactData = {
    user: res.locals.uid,
    boardId: req.body.boardId,
    type: 'bookmark',
  }

  
  try {
    const didBookmark = await Bookmark.didBookmark(res.locals.uid, req.body.boardId)
    
    if (didBookmark) {
      console.log(`[INFO] 유저 ${res.locals.uid} 가 이미 북마크한 글 ${req.body.boardId} 에 북마크를 시도했습니다.`)
      return next(createError(400, '입력값이 적절하지 않습니다.'))
    }

    await Bookmark.create(bookmarkData)
    await React.create(reactData)
    await Board.countBookmark(req.body.boardId, 1)
    await Board.countReact(req.body.boardId, 1)

    const bookmarkCount = await Board.getBookmarkCount(req.body.boardId)

    console.log(`[INFO] 유저 ${res.locals.uid}가 북마크에 ${req.body.boardId}를 추가했습니다.`)
    return res.status(201).json({
      result: 'ok',
      data: bookmarkCount,
    })
  } catch (e) {
    console.log(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

export const deleteBookmark = async (req, res, next) => {
  const userId = res.locals.uid
  const boardId = req.body.boardId

  try {
    const didBookmark = await Bookmark.didBookmark(res.locals.uid, req.body.boardId)
    
    if (!didBookmark) {
      console.log(`[INFO] 유저 ${res.locals.uid} 가 북마크 하지 않은 글 ${req.body.boardId} 에 북마크 해제를 시도했습니다.`)
      return next(createError(400, '입력값이 적절하지 않습니다.'))
    }

    await Bookmark.delete(userId, boardId)
    await React.delete(userId, boardId)
    await Board.countBookmark(req.body.boardId, 0)
    await Board.countReact(req.body.boardId, 0)

    const bookmarkCount = await Board.getBookmarkCount(req.body.boardId)

    console.log(`[INFO] 유저 ${res.locals.uid}가 북마크에 ${req.body.boardId}를 해제했습니다.`)
    return res.status(200).json({
      result: 'ok',
      data: bookmarkCount,
    })
  } catch (e) {
    console.log(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}
