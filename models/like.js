const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const like = new mongoose.Schema({
  uid: { type: ObjectId, required: true },
  targetUid: { type: ObjectId, required: true },
  targetType: { type: String, required: true }, // 글(article), 댓글(reply), 대댓글(replyOnReply)
});

like.statics.create = function (data) {
  const likeData = new this(data);
  return likeData.save();
};

like.statics.unlike = function (likeId) {
  return this.deleteOne({ _id: likeId });
};

// 유저의 좋아요 목록
like.statics.likeList = function (userId) {
  return this.find({ uid: userId });
};

module.exports = mongoose.model("Like", like);
