import * as models from '../models'

/**
 * This wrapper is used for identify whether use bookmarked and liked the content.
 * @param {string}  reqUserId   - Requested user's ObjectId(Mongoose).
 * @param {Array}   contentData - Requested dataset which will be wrapped. *NOTE* that it can be an Object type when it is for viewer data
 * @param {Boolean} isBoard     - To identify data type. Users can bookmark boards only.
 * @param {Boolean} isForViewer - To identify where the data being used. Is it for small viewer(ex. feed, myboard) or large viewer(boardViewer)
 */
export const contentsWrapper = async (reqUserId, contentData, isBoard, isForViewer) => {
  return new Promise(async (resolve, reject) => {
    if (contentData) {
      if (isBoard) {
        /* feedback, reply, bookmark, like, follow */

        // get user bookmark list
        const bookmarkIdSet = await models.Bookmark.find(
          { user: reqUserId },
          { board: 1, _id: 0 }
        )
        const refinedBookmarkIdSet = bookmarkIdSet.map(eachBookmark => {
          return eachBookmark.board.toString()
        })

        // get user like list
        const likeDataSet = await models.Like.find(
          { reqUserId, targetType: 'Board' },
          { targetInfo: 1, _id: 0 }
        )
        const refinedLikeIdSet = likeDataSet.map(eachLike => {
          return eachLike.targetInfo.toString()
        })

        // get user follow list
        const followingUserSet = await models.Follow.find(
          { reqUserId },
          { targetreqUserId: 1, _id: 0 }
        )
        const refinedFollowingIdSet = followingUserSet.map(eachUser => {
          return eachUser.targetreqUserId.toString()
        })

        if (isForViewer) {
          /* For large viewer */
          contentData = contentData.toJSON()
          contentData.bookmarked = refinedBookmarkIdSet.includes(contentData._id.toString())
            ? true
            : false
          contentData.liked = refinedLikeIdSet.includes(contentData._id.toString()) ? true : false
          contentData.writer.following = refinedFollowingIdSet.includes(
            contentData.writer._id.toString()
          )
            ? true
            : false
          if (contentData.writer._id.toString() === reqUserId) {
            contentData.writer.following = 'me'
          }
          resolve(contentData)
        } else {
          /* For many, small viewers */
          const resultSet = []
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
            if (eachBoardData.writer._id.toString() === reqUserId) {
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
      reject(new Error('입력값이 적절하지 않거나 데이터가 존재하지 않습니다.'))
    }
  })
}
