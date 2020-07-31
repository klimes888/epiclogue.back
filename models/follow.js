const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const follow = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  targetUserId: { type: ObjectId, required: true },
});

follow.statics.follow = function (data, cb) {
  const followData = new this(data);
  return followData.save(cb);
};

follow.statics.unfollow = function (unFollowData, cb) {
  return this.deleteOne(
    { userId: unFollowData.userId, targetUserId: unFollowData.targetUserId },
    cb
  );
};

// 유저의 팔로잉 목록
follow.statics.getFollowingList = function (userId, cb) {
  return this.find({ userId }, cb);
};

// 유저의 팔로워 목록
follow.statics.getFollowerList = function (targetUserId, cb) {
  return this.find({ targetUserId }, cb);
};

follow.statics.isFollowing = function (userId, targetUserId, cb) {
  return this.findOne({ userId, targetUserId }, cb)
}

module.exports = mongoose.model("follow", follow);
