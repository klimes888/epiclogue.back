import mongoose from 'mongoose'
import { Board, Feedback, Reply } from './'
const ObjectId = mongoose.ObjectId

const like = new mongoose.Schema({
  userId: { type: ObjectId, required: true, ref: 'User' },
  targetType: { type: String, required: true }, // 글(board), 댓글(feedback), 대댓글(reply)
  targetId: { type: ObjectId, required: true, ref: 'Board Feedback Reply' },
  createdAt: { type: Date, default: Date.now },
})

like.statics.like = function (data) {
  const likeData = new this(data)
  return likeData.save()
}

like.statics.unlike = function (data) {
  return this.deleteOne({
    userId: data.userId,
    targetType: data.targetType,
    targetId: data.targetId,
  })
}

// 유저의 좋아요 목록
like.statics.getByUserId = async function (userId) {
  const resultData = [];
  const likeDataSet = await this.find({ userId }, { userId: 0 })
  
  // filter(projection) options
  const boardFilterOption = {
    feedbacks: 0,
    allowSecondaryCreation: 0,
    __v: 0,
  }

  const feedbackFilterOption = {
    replies: 0,
    __v: 0
  }

  const replyFilterOption = {
    boardId: 0,
    __v: 0
  }

  // iteration for data
  for (let data of likeDataSet) {
    let eachBracket = {
      _id: data._id,
      createAt: data._createdAt,
      type: data._targetType,
    }
    if (data.targetType === 'board') {
      const frag = await Board.getById(data.targetId, boardFilterOption)
      eachBracket.data = frag
    } else if (data.targetType === 'feedback') {
      const frag = await Feedback.getById(data.targetId, feedbackFilterOption)
      eachBracket.data = frag
    } else if (data.targetType === 'reply') {
      const frag = await Reply.getById(data.targetId, replyFilterOption)
      eachBracket.data = frag
    }

    resultData.push(eachBracket)
  }
  return resultData
}

like.statics.getCount = function (likeData) {
  return this.find(
    { targetType: likeData.targetType, targetId: likeData.targetId },
    {
      _id: 0,
      createAt: 1,
    }
  )
}

export default mongoose.model('Like', like)
