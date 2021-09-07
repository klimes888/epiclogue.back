import { startSession } from 'mongoose'
import { apiErrorGenerator } from '../lib/apiErrorGenerator'
import { Like, Board, Feedback, Reply, React } from '../models'

export const like = async (likeData, targetInfo, targetType, loggedUserId) => {
  let targetData
  let likeCount
  const likeTypes = ["Board", "Feedback", "Reply"]

  if (!likeTypes.includes(likeData.targetType)) {
    throw apiErrorGenerator(400, '좋아요를 하려는 게시글 형태가 적절하지 않습니다.')
  }

  const session = await startSession()
  try {
    await session.withTransaction(async () => {
      await Like.create([likeData], { session })

      likeCount = await Like.countDocuments({ targetInfo, targetType }).session(session)

      if (targetType === 'Board') {
        await React.create(
          [
            {
              user: loggedUserId,
              boardId: targetInfo,
              type: 'like',
            },
          ],
          { session }
        )

        targetData = await Board.findOne({ _id: targetInfo }, { writer: 1 })
      } else if (targetType === 'Feedback') {
        targetData = await Feedback.findOne({ _id: targetInfo }, { writer: 1 })
      } else if (targetType === 'Reply') {
        targetData = await Reply.findOne({ _id: targetInfo }, { writer: 1 })
      } 
    })
  } catch (e) {
    throw apiErrorGenerator(500, `[LikeError] 알 수 없는 에러가 발생했습니다. ${e}`)
  } finally {
    session.endSession()
  }

  return {
    targetData,
    likeCount,
  }
}

export const unlike = async (likeData, targetInfo, targetType) => {
  let likeCount
  const session = await startSession()
  try {
    await session.withTransaction(async () => {
      // session function must change direct use model to dao
      await Like.deleteOne(likeData).session(session)

      likeCount = await Like.countDocuments({ targetInfo, targetType }).session(session)
    })
  } catch (e) {
    throw new Error(`Error in Like Transaction ${e}`)
  } finally {
    session.endSession()
  }

  return likeCount
}

export const didLike = function (data) {
  return Like.findOne(data)
}

export const getByUserId = async function (userId, targetType) {
  return Like.find(targetType === 'all' ? { userId } : { userId, targetType })
    .populate({ path: 'userId', select: '_id screenId nickname profile' })
    .populate({
      path: 'targetInfo',
      populate: { path: 'writer', select: '_id screenId nickname profile' },
    })
}

export const getIdByUserId = async function (userId) {
  return Like.find({ userId }, { targetInfo: 1 })
}

export const countHearts = async (targetInfo, targetType) =>
  Like.countDocuments({ targetInfo, targetType })
