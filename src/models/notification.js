import mongoose from 'mongoose'

const { ObjectId } = mongoose

/**
 * Notification schema
 * @constructor Notification
 *
 * @var {ObjectId} userId - 알림을 수신할 유저의 ObjectId 입니다.
 * @var {ObjectId} maker - 알림을 발생시킨 유저의 ObjectId 입니다.
 * @var {String} notificationType - 알림의 타입입니다. 어떤 알림인지 알리기 위해 저장합니다.
 * @var {String} targetType - 해당 알림을 발생시킨 주체의 타입입니다. 클라이언트에서 리다이렉션 할 경로를 위해 저장합니다.
 * @var {ObjectId} targetInfo - 해당 알림을 발생시킨 주체로 이동하기위한 Id입니다.
 * @var {ObjectId} highlightId - 알림의 발생 주체를 알려주기 위한 Id입니다. 피드백과 멘션, 대댓글에서 사용됩니다.
 * @var {Date} createdAt - 해당 알림이 발생한 날짜입니다.
 * @var {Boolean} read - 알림 수신 유저의 알림 읽음 여부입니다.
 */
const notification = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  maker: { type: ObjectId, required: true, ref: 'User' },
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
  message: { type: {
    reportType: { type: Number },
    data: { type: String },
    message: { type: String },
    contentStatus: { type: Number },
    status: { type: Number }
  }, default: null },
  targetInfo: { type: ObjectId, required: true, refPath: 'targetType' },
  highlightId: { type: ObjectId },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
})

export default mongoose.model('Notification', notification)
