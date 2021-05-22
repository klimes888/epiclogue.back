import { Notification } from '../models'

// 아래의 행동에 의해 알림이 만들어집니다. 커스텀 알림은 Notice의 형태로 만들 예정입니다.
// const availableTypes = [
//   'Notice',
//   'Bookmark',
//   'Follow',
//   'Feedback',
//   'Reply',
//   'Like',
//   'Mention',
//   'Secondary',
// ];

/**
 * Notification generator.
 *
 * @param {Mongoose.ObjectId} targetUserId - ObjectId who will receive notification.
 * @param {Mongoose.ObjectId} maker - ObjectId who causes notificcation
 * @param {String} notificationType - Notification type.
 * @param {string} targetType - Notification type.
 * @param {Mongoose.ObjectId} targetInfo - ObjectId for link.
 * @param {Mongoose.ObjectId} highlightId - Component id for highlighting
 */
export const makeNotification = async ({
  targetUserId,
  maker,
  notificationType,
  targetType,
  targetInfo,
  highlightId,
}) => {
  try {
    await Notification.create({
      userId: targetUserId,
      maker,
      notificationType,
      targetType,
      targetInfo,
      highlightId,
    })
  } catch (e) {
    throw new Error(`알림 생성중 오류가 발생했습니다. 사유: ${e}`)
  }
}

// 알림목록
export const getNotiList = function (userId, latestId, size = 15) {
  const query = {
    userId,
  }
  if (latestId) {
    query._id = { $lt: latestId }
  }
  return Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(size)
    .populate({
      path: 'maker',
      select: '_id screenId nickname profile',
    })
    .populate({
      path: 'targetInfo',
      select: 'screenId nickname profile boardTitle feedbackBody replyBody boardId parentId',
    })
}

// 전체 읽음
export const setReadAll = function (userId) {
  return Notification.updateMany({ userId }, { $set: { read: true } })
}

export const setReadOne = async (notiId, userId) =>
  Notification.updateOne({ _id: notiId, userId }, { read: true })

export const getUnreadNotiCount = async userId =>
  Notification.countDocuments({ userId, read: false })

export const deleteNoti = async notiId => Notification.deleteOne({ _id: notiId })

export const deleteNotiAll = async userId => Notification.deleteMany({ userId })
