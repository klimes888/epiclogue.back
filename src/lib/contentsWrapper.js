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
          // null check

          contentData.liked = likeIdSet.includes(contentData._id.toString()) ? true : false
          contentData.heartCount = await models.Like.countDocuments({
            targetInfo: contentData._id,
            targetType: 'Board',
          })
          contentData.bookmarked = bookmarkIdSet.includes(contentData._id.toString()) ? true : false
          contentData.bookmarkCount = await models.Bookmark.countDocuments({
            board: contentData._id,
          })
          // writer following check
          if (data.writer && contentData.writer._id.toString() === reqUserId) {
            contentData.writer.following = 'me'
          } else {
            contentData.writer.following = followingIdSet.includes(
              contentData.writer._id.toString()
            )
              ? true
              : false
          }
          // original user following check
          if (contentData.originUserId) {
            contentData.originUserId.following = followingIdSet.includes(
              contentData.originUserId._id.toString()
            )
              ? true
              : false
          }

          // like, following on feedbacks
          const feedbacks = []
          likeIdSet = await getLikeIdSet(reqUserId, 'Feedback')
          const filteredFeedbacks = contentData.feedbacks.filter(each => {
            return each.writer !== null
          })
          for (let eachFeedback of filteredFeedbacks) {
            eachFeedback.liked = likeIdSet.includes(eachFeedback._id.toString()) ? true : false
            eachFeedback.heartCount = await models.Like.countDocuments({
              targetInfo: eachFeedback._id,
            })
            if (eachFeedback.writer._id.toString() === reqUserId) {
              eachFeedback.writer.following = 'me'
            } else {
              eachFeedback.writer.following = followingIdSet.includes(
                eachFeedback.writer._id.toString()
              )
            }
            feedbacks.push(eachFeedback)
          }
          contentData.feedbacks = feedbacks
          contentData.feedbackCount = feedbacks.length
          contentData.reactCount = await models.React.countDocuments({ boardId: contentData._id })

          resolve(contentData)
        } else {
          /* For many, small viewers */
          const resultSet = []
          // null check
          const filteredData = contentData.filter(each => {
            return each.writer !== null
          })
          for (let data of filteredData) {
            data = data.toJSON()
            data.bookmarked = bookmarkIdSet.includes(data._id.toString()) ? true : false
            data.liked = likeIdSet.includes(data._id.toString()) ? true : false
            // If get boards from board router
            if (data.writer && data.writer._id.toString() === reqUserId) {
              data.writer.following = 'me'
              // If get boards from bookmark router
            } else if (data.user && data.user._id.toString() === reqUserId) {
              data.user.following = 'me'
            } else {
              data.writer.following = followingIdSet.includes(data.writer._id.toString())
                ? true
                : false
            }
            resultSet.push(data)
          }
          resolve(resultSet)
        }
      } else if (contentType === 'User') {
        const resultSet = []

        for (let userData of contentData) {
          // 팔로우 여부 (회원일 경우에만 적용)
          userData = userData.toJSON()
          if (reqUserId) {
            userData.isFollowing =
            userData._id === reqUserId
              ? (await Follow.didFollow({
                  userId: reqUserId,
                  targetUserId: userData._id,
                }))
                ? true
                : false
              : 'me'
          }

          // 작품 수
          userData.illustCount = await models.Board.countByWriterAndCategory(userData._id, 0)
          userData.comicCount = await models.Board.countByWriterAndCategory(userData._id, 1)
          resultSet.push(userData)
        }
        resolve(resultSet)
      } else {
        /* following, like on feedbacks and replies */
        const likeIdSet = await getLikeIdSet(reqUserId, contentType)
        const resultSet = []
        const filteredData = contentData.filter(each => {
          return each.writer !== null
        })
        for (let data of filteredData) {
          data = data.toJSON()
          data.liked = likeIdSet.includes(data._id.toString()) ? true : false
          if (data.writer && data.writer._id.toString() === reqUserId) {
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
