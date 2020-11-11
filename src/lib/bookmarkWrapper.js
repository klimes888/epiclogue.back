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
        eachBoardData.isBookmarked = refinedBookmarkIdSet.includes(eachBoardData._id.toString()) ? true : false
        resultSet.push(eachBoardData)
      }
      resolve(resultSet)
    } else {
      reject(new Error('데이터가 존재하지 않습니다.'))
    }
  })
}
