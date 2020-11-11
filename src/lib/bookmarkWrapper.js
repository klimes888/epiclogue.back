import * as models from '../models'

// 북마크 여부를 체크하기 위한 wrapper
export const bookmarkWrapper = async (userId, boardDataSet) => {
  return new Promise(async (resolve, reject) => {
    let resultSet = []
    if (boardDataSet) {
      const bookmarkIdSet = await models.Bookmark.find({ user: userId }, { board: 1, _id: 0 })
      // chaining can't be here... (toString() is not defined)
      const refinedBookmarkIdSet = bookmarkIdSet.map(eachBookmark => {
        return eachBookmark.board.toString()
      })

      // console.log(refinedBookmarkIdSet)

      for (const data of boardDataSet) {
        const eachBoardData = data.toJSON()
        eachBoardData.bookmarked = refinedBookmarkIdSet.includes(eachBoardData._id.toString())
          ? true
          : false
        resultSet.push(eachBoardData)
      }
      resolve(resultSet)
    } else {
      reject(new Error('데이터가 존재하지 않습니다.'))
    }
  })
}

/**
 * This wrapper is used for identify whether use bookmarked and liked the content.
 * @param {string}  userId      - Requested user's ObjectId(Mongoose).
 * @param {Array}   contentData - Requested dataset which will be wrapped. *NOTE* that it can be an Object type when it is for viewer data
 * @param {Boolean} isBoard     - To identify data type. Users can bookmark boards only.
 * @param {Boolean} isForViewer - To identify where the data being used. Is it for small viewer(ex. feed, myboard) or large viewer(boardViewer)
 */
export const contentWrapper = async (userId, contentData, isBoard, isForViewer) => {
  return new Promise(async (resolve, reject) => {
    if (contentData) {
      if (isBoard) {  // feedback, reply, bookmark, like, follow
        // get user bookmark list
        const bookmarkIdSet = await models.Bookmark.find({ user: userId }, { board: 1, _id: 0 })
        const refinedBookmarkIdSet = bookmarkIdSet.map(eachBookmark => {
          return eachBookmark.board.toString()
        })
        // get user like list
        const likeDataSet = await models.Like.find(
          { userId, targetType: 'Board' },
          { targetInfo: 1, _id: 0 }
        )
        const refinedLikeIdSet = likeDataSet.map(eachLike => {
          return eachLike.targetInfo.toString()
        })
        // get user follow list
        const followingUserSet = await models.Follow.find({ userId }, { targetUserId: 1, _id: 0 })
        const refinedFollowingIdSet = followingUserSet.map(eachUser => {
          return eachUser.targetUserId.toString()
        })

        if (isForViewer) {
          // For large viewer
          // console.log(contentData)
          contentData.toJSON()
          contentData.bookmarked = refinedBookmarkIdSet.includes(contentData._id.toString())
            ? true
            : false
          contentData.liked = refinedLikeIdSet.includes(contentData._id.toString()) ? true : false
          contentData.writer.following = refinedFollowingIdSet.includes(contentData.writer._id.toString())
            ? true
            : false
          resolve(contentData.toJSON())
        } else {
          const resultSet = []
          // For many, small viewers
          for (const data of contentData) {
            const eachBoardData = data.toJSON()
            eachBoardData.bookmarked = refinedBookmarkIdSet.includes(eachBoardData._id.toString())
              ? true
              : false
            eachBoardData.liked = refinedLikeIdSet.includes(eachBoardData._id.toString())
              ? true
              : false
            eachBoardData.writer.following = refinedFollowingIdSet.includes(
              eachBoardData.writer._id.toString()
            )
              ? true
              : false
            if (eachBoardData.writer._id.toString() === userId) {
              eachBoardData.writer.following = 'me'
            }
            resultSet.push(eachBoardData)
          }
          resolve(resultSet)
        }
      } else {
        // feedback, reply, like, follow
      }
    } else {
      reject(new Error('데이터가 존재하지 않습니다.'))
    }
  })
}
