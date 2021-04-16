import { userDAO, boardDAO, bookmarkDAO, notificationDAO } from '../../../DAO'
import { apiErrorGenerator } from '../../../lib/apiErrorGenerator'
import { contentsWrapper } from '../../../lib/contentsWrapper'
import { apiResponser } from '../../../lib/middleware/apiResponser'

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
  const screenId = req.query.screenId || req.params.screenId

  try {
    const userInfo = await userDAO.getIdByScreenId(screenId)
    const bookmarkSet = await bookmarkDAO.getByUserId(userInfo._id)
    const extractionSet = bookmarkSet.filter(each => each.board !== null).map(each => each.board)
    const wrappedBookmarks = res.locals?.uid
      ? await contentsWrapper(res.locals.uid, extractionSet, 'Board', false)
      : extractionSet
    
    return apiResponser({ req, res, data: wrappedBookmarks })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}

/**
 * @description 북마크 추가
 * @access POST /interaction/bookmark
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 글 북마크 수
 */
export const addBookmark = async function (req, res, next) {
  const bookmarkSchema = {
    user: res.locals.uid,
    board: req.body.boardId,
  }

  const reactSchema = {
    user: res.locals.uid,
    boardId: req.body.boardId,
    type: 'bookmark',
  }

  try {
    const didBookmark = await bookmarkDAO.didBookmark(res.locals.uid, req.body.boardId)

    if (didBookmark) {
      return next(apiErrorGenerator(400, '입력값이 적절하지 않습니다.'))
    }

    const targetData = await boardDAO.getWriter(req.body.boardId)
    const bookmarkCount = await bookmarkDAO.create(bookmarkSchema, reactSchema, req.params.boardId)
    // Make notification if requester is not a writer
    if (targetData.writer.toString() !== res.locals.uid) {
      await notificationDAO.makeNotification({
        targetUserId: targetData.writer,
        maker: res.locals.uid,
        notificationType: 'Bookmark',
        targetType: 'Board',
        targetInfo: req.body.boardId,
      })
    }

    return apiResponser({ req, res, statusCode: 201, data: { bookmarkCount } })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}

/**
 * @description 북마크 삭제
 * @access DELETE /interaction/bookmark
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 글 북마크 수
 */
export const deleteBookmark = async (req, res, next) => {
  const userId = res.locals.uid
  const { boardId } = req.body

  try {
    const didBookmark = await bookmarkDAO.didBookmark(userId, boardId)

    if (!didBookmark) {
      return next(apiErrorGenerator(400, '입력값이 적절하지 않습니다.'))
    }
    const bookmarkCount = await bookmarkDAO.deleteBookmark(userId, boardId)
    return apiResponser({ req, res, data: { bookmarkCount }})
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}
