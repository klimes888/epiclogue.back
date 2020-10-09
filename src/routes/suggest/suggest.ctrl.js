import { User, Board } from '../../models'

/* 검색어 제안 기능 */
export const getSearchSuggest = async (req, res, next) => {
  const queryString = req.query.q

  try {
    if (queryString[0] === '@') {
      // user searching
      const _query = queryString.slice(1, queryString.length)
      const userData = await User.getByQuery(_query)
      return res.status(200).json(userData)
    } else {
      // title searching
      const boardData = await Board.getTitlesByQuery(queryString)
      return res.status(200).json(boardData)
    }
  } catch (e) {
    console.error(`[ERROR] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}