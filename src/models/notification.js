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

// 알림목록
notification.statics.getNotiList = function (userId) {
  return this.find({ userId })
}

// 읽음처리
notification.statics.setRead = function (notificationId) {
  return this.updateOne({ _id: notificationId }, { read: true })
}

export default mongoose.model('Notification', notification)
