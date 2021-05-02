import { userDAO, boardDAO, followDAO } from '../../DAO'
import { getBookmarkList } from '../interaction/bookmark/bookmark.ctrl'
import { contentsWrapper } from '../../lib/contentsWrapper'
import { apiResponser } from '../../lib/middleware/apiResponser'
import { apiErrorGenerator } from '../../lib/apiErrorGenerator'
import { parseIntParam } from '../../lib/parseParams'
/**
 * @description 마이보드 - 유저의 프로필 정보 요청
 * @access GET /myboard/:screenId
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns 마이보드 소유자의 정보
 */
export const getMyboard = async (req, res, next) => {
  const { screenId } = req.params
  const projectionOpt = {
    _id: 1,
    nickname: 1,
    intro: 1,
    screenId: 1,
    banner: 1,
    profile: 1,
    joinDate: 1,
  }

  const userData = await userDAO.getByScreenId(screenId, projectionOpt)

  try {
    const myBoardData = userData.toJSON()
    // direct use model must change dao
    myBoardData.followerCount = await followDAO.getFollowerCount(userData._id)
    myBoardData.followingCount = await followDAO.getFollowingCount(userData._id)

    if (req.user?.id) {
      myBoardData.isFollowing =
        req.user.id === userData._id.toString()
          ? 'me'
          : !!(await followDAO.isFollowing(req.user.id, userData._id))
    }

    return apiResponser({ req, res, data: myBoardData })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 오류가 발생했습니다.', e))
  }
}

/**
 * @description 모든 작품 확인
 * @access GET /myboard/:screenId/all
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns Array of all works
 */
export const allWorks = async (req, res, next) => {
  const {latestId, screenId, size} = req.params
  const userId = await userDAO.getIdByScreenId(screenId)
  try {
    const userAllWorks = await boardDAO.findAll(userId._id, latestId, await parseIntParam(size, 25))
    const wrappedWorks = req.user?.uid
      ? await contentsWrapper(req.user.id, userAllWorks, 'Board', false)
      : userAllWorks

    return apiResponser({ req, res, data: wrappedWorks })
  } catch (e) {
    next(apiErrorGenerator(500, '알 수 없는 오류가 발생했습니다.', e))
  }
}

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
    const targetUser = await userDAO.getIdByScreenId(req.params.screenId)
    const myContents = await boardDAO.findAllOriginOrSecondary(targetUser._id, false, req.params.latestId, await parseIntParam(req.params.size, 25))
    const wrappedContents = await contentsWrapper(req.user.id, myContents, 'Board', false)

    return apiResponser({ req, res, data: wrappedContents })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}

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
    const targetUser = await userDAO.getIdByScreenId(req.params.screenId)
    const userSecondaryWorks = await boardDAO.findAllOriginOrSecondary(targetUser._id, true, req.params.latestId, await parseIntParam(req.params.size, 25))
    const wrappedContents = req.user?.uid
      ? await contentsWrapper(req.user.id, userSecondaryWorks, 'Board', false)
      : userSecondaryWorks

    return apiResponser({ req, res, data: wrappedContents })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}

/**
 * @description 북마크 확인
 * @access GET /myboard/:screenId/bookmarks
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns 유저의 북마크 배열
 */
export const bookmarks = (req, res, next) => getBookmarkList(req, res, next)
