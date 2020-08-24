const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const like = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  targetType: { type: String, required: true }, // 글(posts), 댓글(feedback), 대댓글(reply)
  targetId: { type: ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});

like.statics.like = function (data) {
  const likeData = new this(data);
  return likeData.save();
};

like.statics.unlike = function (data) {
  return this.deleteOne({
    userId: data.userId,
    targetType: data.targetType,
    targetId: data.targetId,
  });
};

// 유저의 좋아요 목록
like.statics.getByUserId = function (userId) {
  return this.find({ userId });
};

module.exports = mongoose.model("Like", like);
