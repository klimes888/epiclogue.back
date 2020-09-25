import mongoose from 'mongoose'
const ObjectId = mongoose.ObjectId

const follow = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  targetUserId: { type: ObjectId, required: true },
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

follow.statics.didFollow = function (userId, targetUserId) {
  return this.findOne({ userId, targetUserId })
}

// 유저의 팔로잉 목록
follow.statics.getFollowingList = function (userId) {
  return this.find({ userId })
}

// 유저의 팔로워 목록
follow.statics.getFollowerList = function (targetUserId) {
  return this.find({ targetUserId })
}

follow.statics.isFollowing = function (userId, targetUserId) {
  return this.findOne({ userId, targetUserId })
}

export default mongoose.model('follow', follow)
