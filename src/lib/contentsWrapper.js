import * as models from '../models'

/**
 * This wrapper is used for identify whether use bookmarked and liked the content.
 * @param {string}  reqUserId   - Requested user's ObjectId(Mongoose).
 * @param {Array}   contentData - Requested dataset which will be wrapped. *NOTE* that it can be an Object type when it is for viewer data
 * @param {string}  contentType     - To identify data type. Users can bookmark boards only.
 * @param {Boolean} isForViewer - To identify where the data being used. Is it for small viewer(ex. feed, myboard) or large viewer(boardViewer)
 */
export const contentsWrapper = async (reqUserId, contentData, contentType, isForViewer) => {
  return new Promise(async (resolve, reject) => {
    if (contentData) {
      /* feedback, bookmark, like, follow */
      const followingIdSet = await getFollowingIdSet(reqUserId)
      if (contentType === 'Board') {
        let likeIdSet = await getLikeIdSet(reqUserId, 'Board')
        const bookmarkIdSet = await getBookmarkIdSet(reqUserId)
        if (isForViewer) {
          /* For large viewer */
          contentData = contentData.toJSON()
          // like, bookmark, following on board
          contentData.liked = likeIdSet.includes(contentData._id.toString()) ? true : false
          contentData.bookmarked = bookmarkIdSet.includes(contentData._id.toString()) ? true : false
          contentData.writer.following = followingIdSet.includes(contentData.writer._id.toString())
            ? true
            : false
          if (contentData.writer._id.toString() === reqUserId) {
            contentData.writer.following = 'me'
          }
          // like, following on feedbacks
          const feedbacks = []
          likeIdSet = await getLikeIdSet(reqUserId, 'Feedback')
          for (let eachFeedback of contentData.feedbacks) {
            eachFeedback.liked = likeIdSet.includes(eachFeedback._id.toString()) ? true : false
            eachFeedback.writer.following = followingIdSet.includes(
              eachFeedback.writer._id.toString()
            )
            feedbacks.push(eachFeedback)
          }
          contentData.feedbacks = feedbacks

          resolve(contentData)
        } else {
          /* For many, small viewers */
          const resultSet = []
          for (const data of contentData) {
            const eachBoardData = data.toJSON()
            eachBoardData.bookmarked = bookmarkIdSet.includes(eachBoardData._id.toString())
              ? true
              : false
            eachBoardData.liked = likeIdSet.includes(eachBoardData._id.toString()) ? true : false
            // If get boards from board router
            if (eachBoardData.writer && eachBoardData.writer._id.toString() === reqUserId) {
              eachBoardData.writer.following = 'me'
            // If get boards from bookmark router
            } else if (eachBoardData.user && eachBoardData.user._id.toString() === reqUserId) {
              eachBoardData.user.following = 'me'
            } else {
              eachBoardData.writer.following = followingIdSet.includes(
                eachBoardData.writer._id.toString()
              )
                ? true
                : false
            }
            resultSet.push(eachBoardData)
          }
          resolve(resultSet)
        }
      } else {
        /* following, like on feedbacks and replies */
        const likeIdSet = await getLikeIdSet(reqUserId, contentType)
        const resultSet = []
        for (let data of contentData) {
          data = data.toJSON()
          data.liked = likeIdSet.includes(data._id.toString()) ? true : false
          if (data.writer._id.toString() === reqUserId) {
            data.writer.following = 'me'
          } else {
            data.writer.following = followingIdSet.includes(data.writer._id.toString())
              ? true
              : false
          }
          resultSet.push(data)
        }
        resolve(resultSet)
      }
    } else {
      resolve([])
    }
  })
}

function getBookmarkIdSet(userId) {
  return new Promise(async (resolve, reject) => {
    if (userId) {
      const bookmarkList = await models.Bookmark.find({ user: userId }, { board: 1, _id: 0 })
      const bookmarkIdSet = bookmarkList.map(eachBookmark => {
        return eachBookmark.board.toString()
      })
      resolve(bookmarkIdSet)
    } else {
      reject(new Error('UserId is required.'))
    }
  })
}

function getLikeIdSet(userId, type) {
  return new Promise(async (resolve, reject) => {
    if (userId && type) {
      const likeList = await models.Like.find(
        { userId, targetType: type },
        { targetInfo: 1, _id: 0 }
      )
      const likeIdSet = likeList.map(eachLike => {
        return eachLike.targetInfo.toString()
      })
      resolve(likeIdSet)
    } else {
      reject(new Error('UserId and type is required.'))
    }
  })
}

function getFollowingIdSet(userId) {
  return new Promise(async (resolve, reject) => {
    if (userId) {
      const followingList = await models.Follow.find({ userId }, { targetUserId: 1, _id: 0 })
      const followingIdSet = followingList.map(eachUser => {
        return eachUser.targetUserId.toString()
      })
      resolve(followingIdSet)
    } else {
      reject(new Error('UserId is required.'))
    }
  })
}
