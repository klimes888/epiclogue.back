import { Notification } from '../../models'
/* 
  This is react router.
  base url: /boards/:boardId/react
  OPTIONS: GET
*/

export const getNoti = async (req, res, next) => {
  try {
    const notiData = await Notification.getNotiList(req.params.targetId)

    return res.status(200).json({
      result: 'ok',
      data: notiData,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}

export const setRead = async (req, res, next) => {
  try {
    await Notification.setRead(req.params.targetId)
    return res.status(200).json({
      result: 'ok',
    })
  } catch (e) {
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}
