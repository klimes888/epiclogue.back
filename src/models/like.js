import mongoose from 'mongoose'
const ObjectId = mongoose.ObjectId

const like = new mongoose.Schema({
  userId: { type: ObjectId, required: true, ref: 'User' },
  targetType: { type: String, required: true }, // 글(board), 댓글(feedback), 대댓글(reply)
  /* required가 없으면 각 데이터는 컬럼에 나타나지 않으므로 아래와 같이 모델링 */
  board: { type: ObjectId, ref: 'Board' },
  feedback: { type: ObjectId, ref: 'Feedback' },
  reply: { type: ObjectId, ref: 'Reply' },
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
    board: data.board,
    feedback: data.feedback,
    reply: data.reply,
  })
}

like.statics.didLike = function (data) {
  if (data.targetType === 'board') {
    return this.findOne({ userId: data.userId, board: data.board })
  } else if (data.targetType === 'feedback') {
    return this.findOne({ userId: data.userId, feedback: data.feedback })
  } else if (data.targetType === 'reply') {
    return this.findOne({ userId: data.userId, reply: data.reply })
  }
}

like.statics.getByUserId = async function (userId) {
  return this.find({ userId }, { userId: 0 })
    .populate({ path: 'userId', select: '_id screenId nickname profile' })
    .populate({ path: 'board', populate: { path: 'writer', select: '_id screenId nickname profile '} })
    .populate({ path: 'feedback' })
    .populate({ path: 'reply' })
}

like.statics.getCount = function (likeData) {
  return this.find(
    { targetType: likeData.targetType, targetId: likeData.targetId, board: likeData.board, feedback: likeData.feedback, reply: likeData.reply },
    {
      _id: 0,
      createAt: 1,
    }
  )
}

export default mongoose.model('Like', like)
