import mongoose from 'mongoose'
const ObjectId = mongoose.ObjectId

const notification = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  targetType: {
    type: String,
    required: true,
    enum: ['Feedback', 'Reply', 'Mention', 'Bookmark', 'Follow', 'Like', 'Translate'],
  },
  targetInfo: { type: ObjectId, required: true, refPath: 'targetType' },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
})

notification.statics.create = function (data) {
  const likeData = new this(data)
  return likeData.save()
}

// 알림목록
notification.statics.getNotiList = function (userId) {
  return this.find({ userId })
}

// 읽음처리
notification.statics.setRead = function (notificationId) {
  return this.updateOne({ _id: notificationId }, { read: true })
}

// 삭제
notification.statics.delete = function (notificationId) {
  return this.deleteOne({ _id: notificationId })
}

export default mongoose.model('Notification', notification)
