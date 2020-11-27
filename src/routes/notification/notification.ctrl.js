import { Notification } from '../../models'
import createError from 'http-errors'

/* 
  This is notification router.
  base url: /notification/{notiId}
  OPTIONS: GET, PATCH, DELETE
*/

export const getNoti = async (req, res, next) => {
  try {
    const notiData = await Notification.getNotiList(res.locals.uid)
    console.log(`[INFO] 유저 ${res.locals.uid} 가 알림을 확인했습니다.`)
    return res.status(200).json({
      result: 'ok',
      data: notiData,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'))
  }
}

// export const setRead = async (req, res, next) => {
//   const notiObjectId = Joi.object({
//     _id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
//   })

//   try {
//     await notiObjectId.validateAsync({
//       _id: req.params.notiId
//     })
//   } catch (e) {
//     console.log(`[INFO] 유저 ${res.locals.uid} 가 적절하지 않은 알림 ${req.params.notiId} 을 읽음처리 하려 했습니다.`)
//     next(createError(400, '적절하지 않은 ObjectId입니다.'))
//   }

//   try {
//     const readResult = await Notification.setRead(req.params.notiId)
//     if (readResult.ok === 1 && readResult.nModified === 1) {
//       console.log(`[INFO] 유저 ${res.locals.uid} 가 알림 ${req.params.notiId} 를 읽었습니다.`)
//       return res.status(200).json({
//         result: 'ok',
//       })
//     } else {

//     }
//   } catch (e) {
//     console.error(`[Error] ${e}`)
//     next(createError(500, '알 수 없는 오류가 발생했습니다.'))
//   }
// }

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

export const setReadAll = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: res.locals.uid }, { read: true })
    console.log(`[INFO] 유저 ${res.locals.uid} 가 알림을 모두 읽음처리 했습니다.`)
    return res.status(200).json({
      result: 'ok',
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'))
  }
}
