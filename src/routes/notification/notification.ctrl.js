import { Notification } from '../../models'
import createError from 'http-errors'
import { startSession } from 'mongoose'

/* 
  This is notification router.
  base url: /notification/{notiId}
  OPTIONS: GET, PATCH, DELETE
*/

export const getNoti = async (req, res, next) => {
  const session = await startSession()

  try {
    await session.withTransaction(async () => {
      const notiData = await Notification.getNotiList(res.locals.uid).session(session)
      await Notification.updateMany({ userId: res.locals.uid }, { read: true }, { session })
      console.log(`[INFO] 유저 ${res.locals.uid} 가 알림을 확인했습니다.`)
      return res.status(200).json({
        result: 'ok',
        data: notiData,
      })
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'))
  }
}

export const checkNotified = async (req, res, next) => {
  try {
    const notified = await Notification.find({ userId: res.locals.uid, read: false }, { _id: 1 })
    let notiCount = 0
    if (notified) {
      notiCount = notified.length
    }
      
    console.log(`[INFO] 유저 ${res.locals.uid} 가 알림유무를 확인했습니다.`)
    return res.status(200).json({
      result: 'ok',
      data: { notiCount }
    })    
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'))
  }
}

export const deleteNoti = async (req, res, next) => {
  const notiObjectId = Joi.object({
    _id: Joi.string()
      .regex(/^[a-fA-F0-9]{24}$/)
      .required(),
  })

  try {
    await notiObjectId.validateAsync({
      _id: req.params.notiId,
    })
  } catch (e) {
    console.log(
      `[INFO] 유저 ${res.locals.uid} 가 적절하지 않은 알림 ${req.params.notiId} 을 읽음처리 하려 했습니다.`
    )
    return next(createError(400, '적절하지 않은 ObjectId입니다.'))
  }

  try {
    await Notification.deleteOne({ _id: req.params.notiId })
    console.log(`[INFO] 유저 ${res.locals.uid} 가 알림 ${req.params.notiId} 를 삭제했습니다.`)
    return res.status(200).json({
      result: 'ok',
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'))
  }
}

export const deleteAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: res.locals.uid })
    return res.status(200).json({ result: 'ok' })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError('알 수 없는 오류가 발생했습니다.'))
  }
}
