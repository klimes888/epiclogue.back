import { Like, React, Board, Feedback, Reply, User } from '../../../models'
import makeNotification from '../../../lib/makeNotification'
import createError from 'http-errors'
import { startSession } from 'mongoose'

/*
  This is like router
  base url: /interaction/like[?screenId=lunarcat123]
  OPTIONS: [GET / POST / DELETE]
*/

export const addLike = async (req, res, next) => {
  let likeData = {
    userId: res.locals.uid,
    targetInfo: req.body.targetInfo,
    targetType: req.body.targetType,
  }

  const { targetInfo, targetType } = req.body
  const session = await startSession()

  try {
    const didLike = await Like.didLike(likeData)

    if (didLike) {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 이미 좋아요 한 ${likeData.targetType}:${targetInfo} 에 좋아요를 요청했습니다.`
      )
      return next(createError(400, '이미 처리된 데이터입니다.'))
    }

    await session.withTransaction(async () => {
      await Like.like(likeData)

      let likeCount
      let targetData

      if (targetType === 'Board') {
        const reactSchema = new React({
          user: res.locals.uid,
          boardId: req.body.targetInfo,
          type: 'like',
        })
        await reactSchema.save({ session })
        targetData = await Board.findOne({ _id: req.body.targetInfo }, { writer: 1 })
        await Board.countHeart(targetInfo, 1).session(session)
        await Board.countReact(targetInfo, 1).session(session)
        likeCount = await Board.getHeartCount(targetInfo).session(session)
      } else if (targetType === 'Feedback') {
        await Feedback.countHeart(targetInfo, 1).session(session)
        targetData = await Feedback.findOne({ _id: req.body.targetInfo }, { writer: 1 })
        likeCount = await Feedback.getHeartCount(targetInfo).session(session)
      } else if (targetType === 'Reply') { /* 대댓글의 경우 좋아요 카운트,  */
        await Reply.countHeart(req.body.targetInfo, 1).session(session)
        targetData = await Reply.findOne({ _id: req.body.targetInfo }, { writer: 1 })
        likeCount = await Reply.getHeartCount(targetInfo).session(session)
      }

      /* 자기 자신에게는 알림을 보내지 않음 */
      if (targetData.writer.toString() !== res.locals.uid) {
        await makeNotification({
          targetUserId: targetData.writer,
          maker: res.locals.uid,
          notificationType: 'Like',
          targetType: targetType,
          targetInfo: targetInfo
        }, session)
      }
      console.log(`[INFO] 유저 ${res.locals.uid}가 ${targetType}: ${targetInfo}를 좋아합니다.`)
      return res.status(201).json({
        result: 'ok',
        data: likeCount,
      })
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  } finally {
    session.endSession()
  }
}

export const deleteLike = async (req, res, next) => {
  let likeData = {
    userId: res.locals.uid,
    targetInfo: req.body.targetInfo,
    targetType: req.body.targetType,
  }

  const { targetInfo, targetType } = req.body
  const session = await startSession()

  try {
    const didLike = await Like.didLike(likeData)

    if (!didLike) {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 좋아요 하지 않은 ${targetType}:${targetInfo}에 대해 좋아요를 해제하려 했습니다.`
      )
      return next(createError(400, '이미 처리된 데이터입니다.'))
    }

    await session.withTransaction(async () => {
      await Like.unlike(likeData).session(session)

      let likeCount

      if (targetType === 'Board') {
        await React.delete(likeData.userId, targetInfo).session(session)
        await Board.countHeart(req.body.targetInfo, 0).session(session)
        await Board.countReact(req.body.targetInfo, 0).session(session)
        likeCount = await Board.getHeartCount(targetInfo).session(session)
      } else if (targetType === 'Feedback') {
        await Feedback.countHeart(req.body.targetInfo, 0).session(session)
        likeCount = await Feedback.getHeartCount(targetInfo).session(session)
      } else if (targetType === 'Reply') {
        await Reply.countHeart(req.body.targetInfo, 0).session(session)
        likeCount = await Reply.getHeartCount(targetInfo).session(session)
      }
      console.log(
        `[INFO] 유저 ${res.locals.uid}가 ${targetType}: ${targetInfo}의 좋아요를 해제했습니다.`
      )
      return res.status(200).json({
        result: 'ok',
        data: likeCount,
      })
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  } finally {
    session.endSession()
  }
}

export const getLikeList = async (req, res, next) => {
  const screenId = req.query.screenId
  const targetType = req.query.targetType
  const session = await startSession()

  try {
    await session.withTransaction(async () => {
      const userId = await User.getIdByScreenId(screenId)
      const likeObjectIdList = await Like.getByUserId(userId, targetType)

      console.log(`[INFO] 유저 ${res.locals.uid}가 유저 ${userId} 의 좋아요 리스트를 확인했습니다.`)
      return res.status(200).json({
        result: 'ok',
        data: likeObjectIdList,
      })
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  } finally {
    session.endSession()
  }
}
