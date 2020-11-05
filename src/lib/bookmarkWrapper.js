import * as models from '../models'

// 북마크 여부를 체크하기 위한 wrapper
export const bookmarkWrapper = async (userId, boardDataSet) => {
  if (boardDataSet) {
    const resultSet = []

    for (let data of boardDataSet) {
      data.isBookmarked = true
      const eachData = await models.Feedback.findOne({ user: userId, board: data._id })  

      if (!eachData) {
        data.isBookmarked = false
      }

      console.log(data)

      resultSet.push(data)
    }

    // console.log(resultSet)

    return resultSet
  } else {  // 비어있을 경우
    return []
  }
}