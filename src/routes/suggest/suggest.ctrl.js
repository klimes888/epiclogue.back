import { userDAO, boardDAO } from '../../DAO'
import { apiErrorGenerator } from '../../lib/apiErrorGenerator'
import { apiResponser } from '../../lib/middleware/apiResponser'

/* 검색어 제안 기능 */
export const getSearchSuggest = async (req, res, next) => {
  const queryString = req.query.q

  try {
    if (queryString[0] === '@') {
      // user searching
      const _query = queryString.slice(1, queryString.length)
      const userData = await userDAO.getByQuery(_query)
      return apiResponser({ req, res, data: userData })
    }
    // title searching
    const boardData = await boardDAO.getTitlesByQuery(queryString)
    return apiResponser({ req, res, data: boardData })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}
