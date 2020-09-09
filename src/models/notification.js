import mongoose from "mongoose";
const ObjectId = mongoose.ObjectId;

const notification = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  type: { type: String, required: true }, // 팔로우, 댓글, 대댓글, 번역, 멘션, 북마크 
  targetId: { type: ObjectId, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false}
});

notification.statics.create = function (data) {
  const likeData = new this(data);
  return likeData.save();
};

// 알림목록
notification.statics.getLikeList = function (userId) {
  return this.find({ userId });
};

// 읽음처리
notification.statics.read = function (notificationId) {
  return this.updateOne({ _id: notificationId }, { read: true });
}

// 삭제
notification.statics.delete = function (notificationId) {
  return this.deleteOne({ _id: notificationId });
};


export default mongoose.model("Notification", notification);
