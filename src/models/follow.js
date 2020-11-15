import mongoose from 'mongoose'
const ObjectId = mongoose.ObjectId

const follow = new mongoose.Schema({
  userId: { type: ObjectId, required: true, ref: 'User' },
  targetUserId: { type: ObjectId, required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
})

follow.statics.follow = function (data) {
  const followData = new this(data)
  return followData.save()
}

follow.statics.unfollow = function (unFollowData) {
  return this.deleteOne({
    userId: unFollowData.userId,
    targetUserId: unFollowData.targetUserId,
  })
}

follow.statics.didFollow = async function ({userId, targetUserId}, session) {
  const isFollowing = await this.findOne({ userId, targetUserId }, {}, { session })
  if (isFollowing) {
    return true
  } else {
    return false
  }
}

// 유저의 팔로잉 목록
follow.statics.getFollowingList = function (userId) {
  return this.find({ userId }).populate({ path: 'targetUserId', select: '_id screenId nickname profile' })
}

// 유저의 팔로워 목록
follow.statics.getFollowerList = function (targetUserId) {
  return this.find({ targetUserId }).populate({ path: 'userId', select: '_id screenId nickname profile' })
}

follow.statics.isFollowing = function (userId, targetUserId) {
  return this.findOne({ userId, targetUserId })
}

export default mongoose.model('follow', follow)
