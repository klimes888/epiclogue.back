import * as models from '../models'

const availableTypes = ['Notice', 'Follow', 'Feedback', 'Reply', 'Like', 'Mention', 'Secondary']

/**
 * Integrated notification generator.
 *
 * @param {Mongoose.ObjectId} targetUserId - ObjectId who will receive notification.
 * @param {string} targetType - Notification type. This can be ['Notice', 'Follow', 'Feedback', 'Reply', 'Like', 'Mention', 'Secondary', 'Custom']
 * @param {Mongoose.ObjectId} targetInfo - ObjectId for link
 */
const makeNotification = async ({ targetUserId, targetType, targetInfo }, session) => {
  if (availableTypes.includes(targetType)) {
    await models
      .Notification({
        userId: targetUserId,
        targetType: targetType,
        targetInfo: targetInfo,
      })
      .save({ session })
  } else {
    throw new Error('지정된 타입이 아닙니다.')
  }
}

export default makeNotification
