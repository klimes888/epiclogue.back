import mongoose from 'mongoose'
const ObjectId = mongoose.ObjectId

/**
 * Notification schema
 * @constructor Notification
 *
 * @var {ObjectId} userId - 알림을 수신할 유저의 ObjectId 입니다.
 * @var {String} notificationType - 알림의 타입입니다. 어떤 알림인지 알리기 위해 저장합니다.
 * @var {String} targetType - 해당 알림을 발생시킨 주체의 타입입니다. 클라이언트에서 리다이렉션 할 경로를 위해 저장합니다.
 * @var {ObjectId} targetInfo - 해당 알림을 발생시킨 주체의 ObjectId입니다.
 * @var {Date} createdAt - 해당 알림이 발생한 날짜입니다.
 * @var {Boolean} read - 알림 수신 유저의 알림 읽음 여부입니다.
 *
 */
const notification = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  notificationType: {
    type: String,
    requred: true,
    enum: ['Notice', 'Bookmark', 'Follow', 'Feedback', 'Reply', 'Like', 'Mention', 'Secondary'],
  },
  targetType: {
    type: String,
    required: true,
    enum: ['Board', 'Feedback', 'Reply', 'User'],
  },
  targetInfo: { type: ObjectId, required: true, refPath: 'targetType' },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
})

// 알림목록
notification.statics.getNotiList = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 })
}

// 전체 읽음
notification.statics.setReadAll = function (userId) {
  return this.updateMany({ userId }, { $set: { read: true } })
}

// (deprecated) 한 개 읽음
notification.statics.setRead = function (notificationId) {
  return this.updateOne({ _id: notificationId }, { read: true })
}

export default mongoose.model('Notification', notification)
