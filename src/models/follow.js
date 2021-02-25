import mongoose from 'mongoose';

const { ObjectId } = mongoose;

const follow = new mongoose.Schema({
  userId: { type: ObjectId, required: true, ref: 'User' },
  targetUserId: { type: ObjectId, required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

follow.statics.follow = function (data) {
  const followData = new this(data);
  return followData.save();
};

follow.statics.unfollow = function (unFollowData) {
  return this.deleteOne({
    userId: unFollowData.userId,
    targetUserId: unFollowData.targetUserId,
  });
};

follow.statics.didFollow = async function ({ userId, targetUserId }, session) {
  const isFollowing = await this.findOne({ userId, targetUserId }, {}, { session });
  if (isFollowing) {
    return true;
  }
  return false;
};

// 유저의 팔로잉 목록
follow.statics.getFollowingList = function (userId) {
  return this.find({ userId }, { _id: 0, userId: 0, __v: 0 }).populate({
    path: 'targetUserId',
    select: '_id screenId nickname profile',
  });
};

follow.statics.getFollowingIdList = function (userId) {
  return this.find({ userId }, { targetUserId: 1 });
};

// 유저의 팔로워 목록
follow.statics.getFollowerList = function (targetUserId) {
  return this.find({ targetUserId }, { _id: 0, targetUserId: 0, __v: 0 }).populate({
    path: 'userId',
    select: '_id screenId nickname profile',
  });
};

follow.statics.getFollowerIdList = function (targetUserId) {
  return this.find({ targetUserId }, { userId: 1 });
};

follow.statics.isFollowing = function (userId, targetUserId) {
  return this.findOne({ userId, targetUserId });
};

export default mongoose.model('Follow', follow);
