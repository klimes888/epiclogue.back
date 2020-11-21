import { User, Board } from '../../models'
import board from '../../models/board'

/* 검색 화면 렌더링을 가정한 데이터 API */
export const searchResult = async (req, res, next) => {
  const queryString = req.query.q

  try {
    const boardData = await Board.getByQuery(queryString)
    const filteredData = boardData.filter(data => {
      return data.writer !== null
    })
    console.log(`[INFO] 유저 ${res.locals.uid} 가 ${queryString} 을 검색했습니다.`)
    return res.status(200).json(filteredData)
  } catch (e) {
    console.error(`[ERROR] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}
