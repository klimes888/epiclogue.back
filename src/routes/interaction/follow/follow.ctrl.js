import { userDAO, followDAO, notificationDAO } from '../../../DAO'
import { apiErrorGenerator } from '../../../lib/apiErrorGenerator'
import { contentsWrapper } from '../../../lib/contentsWrapper'
import { apiResponser } from '../../../lib/middleware/apiResponser'

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
  }

  try {
    const didFollow = await followDAO.didFollow(followData)

    if (didFollow) {
      return next(apiErrorGenerator(400, '이미 처리된 요청입니다.'))
    }
    const followCount = await followDAO.follow(followData)
    await notificationDAO.makeNotification({
      targetUserId: req.body.targetUserId,
      maker: res.locals.uid,
      notificationType: 'Follow',
      targetType: 'User',
      targetInfo: res.locals.uid,
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
    userId: res.locals.uid,
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
  const { screenId, type } = req.query
  const userId = await userDAO.getIdByScreenId(screenId)

  try {
    const requestedData =
      type === 'following'
        ? await followDAO.getFollowingList(userId._id)
        : await followDAO.getFollowerList(userId._id)

    const wrappedFollowData = await contentsWrapper(res.locals?.uid, requestedData, 'Follow', false)

    return apiResponser({ req, res, data: wrappedFollowData })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}
