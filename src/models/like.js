import mongoose from 'mongoose'
const ObjectId = mongoose.ObjectId

const like = new mongoose.Schema({
  userId: { type: ObjectId, required: true, ref: 'User' },
  targetType: {type: String, required: true},
  targetInfo: {type: ObjectId, required: true , refPath: 'targetType'},
  createdAt: { type: Date, default: Date.now },
})

like.statics.like = function (data) {
  const likeData = new this(data)
  return likeData.save()
}

like.statics.unlike = function (data) {
  return this.deleteOne(data)
}

like.statics.didLike = function (data) {
  return this.findOne(data)
}

like.statics.getByUserId = async function (userId, targetType) {
  return this.find(targetType === 'all' ? { userId } : { userId, targetType })
  .populate({ path: 'userId', select: '_id screenId nickname profile' })
  .populate({path: 'targetInfo'})
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
