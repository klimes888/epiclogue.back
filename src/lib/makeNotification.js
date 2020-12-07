import * as models from '../models'

// 아래의 행동에 의해 알림이 만들어집니다. 커스텀 알림은 Notice의 형태로 만들 예정입니다.
const availableTypes = [
  'Notice',
  'Bookmark',
  'Follow',
  'Feedback',
  'Reply',
  'Like',
  'Mention',
  'Secondary',
]

/**
 * Notification generator.
 *
 * @param {Mongoose.ObjectId} targetUserId - ObjectId who will receive notification.
 * @param {String} notificationType - Notification type.
 * @param {string} targetType - Notification type.
 * @param {Mongoose.ObjectId} targetInfo - ObjectId for link.
 */
const makeNotification = async (
  { targetUserId, maker, notificationType, targetType, targetInfo, highlightId },
  session
) => {
  if (availableTypes.includes(notificationType)) {
    await models
      .Notification({
        userId: targetUserId,
        maker,
        notificationType,
        targetType,
        targetInfo,
        highlightId,
      })
      .save({ session })
  } else {
    throw new Error(`지정된 타입이 아닙니다: ${notificationType}`)
  }
}

export default makeNotification
