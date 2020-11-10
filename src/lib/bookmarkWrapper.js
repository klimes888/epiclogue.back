import * as models from '../models'

// 북마크 여부를 체크하기 위한 wrapper
export const bookmarkWrapper = async (userId, boardDataSet) => {
  return new Promise(async (resolve, reject) => {
    let resultSet = []
    if (boardDataSet) {
      const bookmarkSetFromDB = await models.Bookmark.find({ user: userId }, { board: 1, _id: 0 })
      // boardId만 추출
      const bookmarkIdSet = bookmarkSetFromDB.map(eachBookmark => {
        return eachBookmark.board.toString()
      })

      for (let eachBoardData of boardDataSet) {
        if (bookmarkIdSet.includes(eachBoardData._id.toString())) {
          eachBoardData.isBookmarked = true
        } else {
          eachBoardData.isBookmarked = false
        }
        console.log(eachBoardData)
        resultSet.push(eachBoardData)
      }

      resolve(resultSet)
    } else {
      reject(new Error('데이터가 존재하지 않습니다.'))
    }
  })
}
