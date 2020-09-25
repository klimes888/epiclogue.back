import { Like, React, Board, Feedback, Reply, User } from '../../../models'

/*
  This is like router
  base url: /interaction/like[?screenId=lunarcat123]
  OPTIONS: [GET / POST / DELETE]
*/

export const addLike = async (req, res, next) => {
  let likeData = { userId: res.locals.uid, targetType: req.body.targetType }

  const { targetId, targetType } = req.body

  if (targetType === 'board') {
    likeData.board = targetId
  } else if (targetType === 'feedback') {
    likeData.feedback = targetId
  } else if (targetType === 'reply') {
    likeData.reply = targetId
  }

  try {
    await Like.like(likeData)

    console.log(`[INFO] 유저 ${res.locals.uid}가 ${targetType}: ${targetId}를 좋아합니다.`)

    let likeCount

    if (targetType === 'board') {
      const reactData = {
        user: res.locals.uid,
        boardId: req.body.targetId,
        type: 'like',
      }
      await React.create(reactData)
      await Board.countHeart(targetId, 1)
      await Board.countReact(targetId, 1)
      likeCount = await Board.getHeartCount(targetId)
    } else if (targetType === 'feedback') {
      await Feedback.countHeart(targetId, 1)
      likeCount = await Feedback.getHeartCount(targetId)
    } else if (targetType === 'reply') {
      await Reply.countHeart(req.body.targetId, 1)
      likeCount = await Reply.getHeartCount(targetId)
    }

    return res.status(201).json({
      result: 'ok',
      data: likeCount,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}

export const deleteLike = async (req, res, next) => {
  let likeData = { userId: res.locals.uid, targetType: req.body.targetType }

  const { targetId, targetType } = req.body

  if (targetType === 'board') {
    likeData.board = targetId
  } else if (targetType === 'feedback') {
    likeData.feedback = targetId
  } else if (targetType === 'reply') {
    likeData.reply = targetId
  }

  try {
    await Like.unlike(likeData)
    console.log(
      `[INFO] 유저 ${res.locals.uid}가 ${targetType}: ${targetId}의 좋아요를 해제했습니다.`
    )
    let likeCount

    if (targetType === 'board') {
      await React.delete(likeData.userId, targetId)
      await Board.countHeart(req.body.targetId, 0)
      await Board.countReact(req.body.targetId, 0)
      likeCount = await Board.getHeartCount(targetId)
    } else if (targetType === 'feedback') {
      await Feedback.countHeart(req.body.targetId, 0)
      likeCount = await Feedback.getHeartCount(targetId)
    } else if (targetType === 'reply') {
      await Reply.countHeart(req.body.targetId, 0)
      likeCount = await Reply.getHeartCount(targetId)
    }

    return res.status(200).json({
      result: 'ok',
      data: likeCount,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}

export const getLikeList = async (req, res, next) => {
  const screenId = req.query.screenId

  try {
    const userId = await User.getIdByScreenId(screenId)
    const likeObjectIdList = await Like.getByUserId(userId)
    console.log(`[INFO] 유저 ${res.locals.uid}가 유저 ${userId} 의 좋아요 리스트를 확인했습니다.`)
    return res.status(200).json({
      result: 'ok',
      data: likeObjectIdList,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}
