import { startSession } from 'mongoose'
import { Like, Board, Feedback, Reply, React } from '../models'

export const like = async (likeData, targetInfo, targetType, loggedUserId) => {
    let targetData
    let likeCount
    const session = await startSession();
    try {
      await session.withTransaction(async () => {
        await Like.create([likeData], { session });
  
        likeCount = await Like.countDocuments({ targetInfo, targetType }).session(session);
  
        if (targetType === 'Board') {
          await React.create([{
            user: loggedUserId,
            boardId: targetInfo,
            type: 'like',
          }], {session});
  
          targetData = await Board.findOne({ _id: targetInfo }, { writer: 1 });
        } else if (targetType === 'Feedback') {
          targetData = await Feedback.findOne({ _id: targetInfo }, { writer: 1 });
        } else if (targetType === 'Reply') {
          targetData = await Reply.findOne({ _id: targetInfo }, { writer: 1 });
        }
      });
    } catch(e) {
      throw new Error(`Error in Like Tracsaction ${e}`)
    } finally {
      session.endSession()
    }

    return {
      targetData,
      likeCount
    }
  };
  
export const unlike = async (likeData, targetInfo, targetType) => {
  let likeCount
    const session = await startSession()
    try {
      await session.withTransaction(async () => { // session function must change direct use model to dao
        await Like.deleteOne(likeData).session(session);
  
        likeCount = await Like.countDocuments({ targetInfo, targetType }).session(session);
      });
    } catch(e) {
      throw new Error(`Error in Like Transaction ${e}`)
    } finally {
      session.endSession()
    }

    return likeCount
  };
  
export const didLike = function (data) {
    return Like.findOne(data);
  };
  
export const getByUserId = async function (userId, targetType) {
    return Like.find(targetType === 'all' ? { userId } : { userId, targetType })
      .populate({ path: 'userId', select: '_id screenId nickname profile' })
      .populate({
        path: 'targetInfo',
        populate: { path: 'writer', select: '_id screenId nickname profile' },
      });
  };
  
export const countHearts = function (targetInfo, targetType) {
    return Like.countDocuments({ targetInfo, targetType });
  };