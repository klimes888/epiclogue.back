import { Notification } from '../../models'
import createError from 'http-errors'

/* 
  This is notification router.
  base url: /notifications?[targetId]
  OPTIONS: GET, POST
*/

export const getNoti = async (req, res, next) => {
  try {
    const notiData = await Notification.getNotiList(res.locals.uid)

    console.log(`[INFO] 유저 ${res.locals.uid} 가 알림목록을 확인합니다.`)
    return res.status(200).json({
      result: 'ok',
      data: notiData,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'))
  }
}

export const setRead = async (req, res, next) => {
  try {
    await Notification.setRead(req.params.targetId)

    console.log(`[INFO] 유저 ${res.locals.uid} 가 알림 ${req.params.targetId} 를 확인했습니다.`)
    return res.status(200).json({
      result: 'ok',
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'))
  }
}
