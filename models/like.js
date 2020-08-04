const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const like = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  targetType: { type: String, required: true }, // 글(posts), 댓글(feedback), 대댓글(reply)
  targetId: { type: ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});

like.statics.like = function (data, cb) {
  const likeData = new this(data);
  return likeData.save(cb);
};

like.statics.unlike = function (data, cb) {
  return this.deleteOne({
    userId: data.userId,
    targetType: data.targetType,
    targetId: data.targetId,
  }, cb);
};

// 유저의 좋아요 목록
like.statics.getByUserId = function (userId, cb) {
  return this.find({ userId }, cb);
};

module.exports = mongoose.model("Like", like);
