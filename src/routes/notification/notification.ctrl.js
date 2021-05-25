import Joi from 'joi'
import { notificationDAO } from '../../DAO'
import { apiErrorGenerator } from '../../lib/apiErrorGenerator'
import { apiResponser } from '../../lib/middleware/apiResponser'
import { parseIntParam } from '../../lib/parseParams'

/**
 * @description 모든 알림 확인
 * @access GET /notification
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns 사용자의 모든 알림
 */
export const getNoti = async (req, res, next) => {
  try {
    const notiData = await notificationDAO.getNotiList(req.user.id, 
      req.query.latestId, 
      await parseIntParam(req.params.size, 15)
    )
    return apiResponser({ req, res, data: notiData })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 오류가 발생했습니다.', e))
  }
}

/**
 * @description 특정 알림 읽음 처리
 * @access PATCH /notification
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns -
 */
export const setRead = async (req, res, next) => {
  try {
    await notificationDAO.setReadOne(req.body.notiId, req.user.id)
    return apiResponser({ req, res, message: '알림 한 개를 읽음처리 했습니다.' })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 오류가 발생했습니다.', e))
  }
}

/**
 * @description 모든 알림 읽음처리
 * @access PATCH /notification/all
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns -
 */
export const setReadAll = async (req, res, next) => {
  try {
    await notificationDAO.setReadAll(req.user.id)
    return apiResponser({ req, res, message: '모든 알림을 읽음처리 했습니다.' })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 오류가 발생했습니다.', e))
  }
}

/**
 * @description 새로운 알림 유무
 * @access GET /notification/check
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns 새로운 알림 유무(true/false)
 */
export const checkNotified = async (req, res, next) => {
  try {
    const notiCount = await notificationDAO.getUnreadNotiCount(req.user.id)
    return apiResponser({ req, res, data: { notiCount } })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 오류가 발생했습니다.', e))
  }
}

/**
 * @description 알림 삭제
 * @access DELETE /notification
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns -
 */
export const deleteNoti = async (req, res, next) => {
  const notiObjectId = Joi.object({
    _id: Joi.string()
      .regex(/^[a-fA-F0-9]{24}$/)
      .required(),
  })

  try {
    await notiObjectId.validateAsync({
      _id: req.body.notiId,
    })
  } catch (e) {
    return next(apiErrorGenerator(400, '적절하지 않은 ObjectId입니다.', e))
  }

  try {
    await notificationDAO.deleteNoti(req.body.notiId)
    return apiResponser({ req, res, message: '알림을 삭제했습니다.' })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 오류가 발생했습니다.', e))
  }
}

/**
 * @description 모든 알림 삭제
 * @access DELETE /notification/all
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns -
 */
export const deleteAll = async (req, res, next) => {
  try {
    await notificationDAO.deleteNotiAll(req.user.id)
    return apiResponser({ req, res, message: '모든 알림을 삭제했습니다.' })
  } catch (e) {
    return next(apiErrorGenerator('알 수 없는 오류가 발생했습니다.', e))
  }
}
