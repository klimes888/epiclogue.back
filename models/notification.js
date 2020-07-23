const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const notification = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  type: { type: String, required: true }, // 팔로우, 댓글, 대댓글, 번역, 멘션, 북마크 
  targetId: { type: ObjectId, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false}
});

notification.statics.create = function (data, cb) {
  const likeData = new this(data);
  return likeData.save(cb);
};

// 알림목록
notification.statics.getLikeList = function (userId, cb) {
  return this.find({ userId }, cb);
};

// 읽음처리
notification.statics.read = function (notificationId, cb) {
  return this.updateOne({ _id: notificationId }, { read: true }, cb);
}

// 삭제
notification.statics.delete = function (notificationId, cb) {
  return this.deleteOne({ _id: notificationId }, cb);
};


module.exports = mongoose.model("Notification", notification);
