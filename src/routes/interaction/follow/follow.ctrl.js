import { userDAO, followDAO, notificationDAO } from '../../../DAO'
import { apiErrorGenerator } from '../../../lib/apiErrorGenerator'
import { contentsWrapper } from '../../../lib/contentsWrapper'
import { apiResponser } from '../../../lib/middleware/apiResponser'
import { parseIntParam } from '../../../lib/parseParams'

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
    userId: req.user.id,
    targetUserId: req.body.targetUserId,
  }

  try {
    const didFollow = await followDAO.didFollow(followData)

    if (didFollow) {
      return next(apiErrorGenerator(400, '이미 처리된 요청입니다.'))
    }
    const followCount = await followDAO.follow(followData)
    await notificationDAO.makeNotification({
      targetUserId: req.body.targetUserId,
      maker: req.user.id,
      notificationType: 'Follow',
      targetType: 'User',
      targetInfo: req.user.id,
    })
    return apiResponser({ req, res, statusCode: 201, data: { followCount } })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}

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
    userId: req.user.id,
    targetUserId: req.body.targetUserId,
  }

  try {
    const didFollow = await followDAO.didFollow(followData)

    if (!didFollow) {
      return next(apiErrorGenerator(400, '이미 처리된 요청입니다.'))
    }
    const followCount = await followDAO.unfollow(followData)

    return apiResponser({ req, res, data: { followCount } })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}

/**
 * @description 팔로잉/팔로워 리스트 확인
 * @access GET /interaction/follow?screenId={SCREENID}&type=[following/follower]
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 팔로잉 또는 팔로워 리스트
 */
export const getFollow = async (req, res, next) => {
  const { screenId, type, latestId, size } = req.query
  const userId = await userDAO.getIdByScreenId(screenId)

  try {
    const requestedData =
      type === 'following'
        ? await followDAO.getFollowingList(userId._id, latestId, parseIntParam(size, 15))
        : await followDAO.getFollowerList(userId._id, latestId, parseIntParam(size, 15))

    const wrappedFollowData = await contentsWrapper(req.user?.id, requestedData, 'Follow', false)

    return apiResponser({ req, res, data: wrappedFollowData })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}
