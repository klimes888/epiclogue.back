const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const follow = new mongoose.Schema({
  uid: { type: ObjectId, required: true },
  targetUid: { type: ObjectId, required: true },
});

follow.statics.create = function (data) {
  const followData = new this(data);
  return followData.save();
};

follow.statics.unfollow = function ({ userId, targetUserId }) {
  return this.deleteOne({ uid: userId, targetUid: targetUserId });
};

// 유저의 팔로우 목록
follow.statics.followList = function (userId) {
  return this.find({ uid: userId });
};

// 유저의 팔로워 목록
follow.statics.followerList = function (userId) {
  return this.find({ targetUid: userId });
};

module.exports = mongoose.model("follow", follow);
