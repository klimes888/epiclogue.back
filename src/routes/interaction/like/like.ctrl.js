import { likeDAO, reactDAO, userDAO, notificationDAO } from '../../../DAO'
import { apiErrorGenerator } from '../../../lib/apiErrorGenerator'
import { apiResponser } from '../../../lib/middleware/apiResponser'

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
    userId: req.user.id,
    targetType: req.body.targetType,
    targetInfo: req.body.targetInfo,
  }

  const { targetInfo, targetType } = req.body

  try {
    const didLike = await likeDAO.didLike(likeData)

    if (didLike) {
      return next(apiErrorGenerator(400, '이미 처리된 요청입니다.'))
    }

    let likeCount
    let targetData

    try {
      // 비구조화 할당을 위해 소괄호 사용
      ;({ likeCount, targetData } = await likeDAO.like(
        likeData,
        targetInfo,
        targetType,
        req.user.id
      ))
    } catch (e) {
      return next(e)
    }

    /* 자기 자신에게는 알림을 보내지 않음 */
    if (targetData.writer.toString() !== req.user.id) {
      await notificationDAO.makeNotification({
        targetUserId: targetData.writer,
        maker: req.user.id,
        notificationType: 'Like',
        targetType,
        targetInfo,
      })
    }

    return apiResponser({ req, res, statusCode: 201, data: { heartCount: likeCount } })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}

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
    userId: req.user.id,
    targetInfo: req.body.targetInfo,
    targetType: req.body.targetType,
  }

  const { targetInfo, targetType } = req.body

  try {
    const didLike = await likeDAO.didLike(likeData)

    if (!didLike) {
      return next(apiErrorGenerator(400, '이미 처리된 요청입니다.'))
    }
    const likeCount = await likeDAO.unlike(likeData, targetInfo, targetType)
    if (targetType === 'Board') {
      await reactDAO.deleteReact(likeData.userId, targetInfo)
    }

    return apiResponser({ req, res, data: { heartCount: likeCount } })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}

/**
 * @description 좋아요 리스트 확인
 * @access GET /interaction/like?screenId={SCREENID}&type=[Board, Feedback, Reply]
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const getLikeList = async (req, res, next) => {
  const { screenId } = req.query
  const { type: targetType } = req.query

  try {
    const userId = await userDAO.getIdByScreenId(screenId)
    const likeObjectIdList = await likeDAO.getByUserId(userId, targetType)

    return apiResponser({ req, res, data: likeObjectIdList })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}
