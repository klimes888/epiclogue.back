import { userDAO, boardDAO } from '../../DAO'
import { apiErrorGenerator } from '../../lib/apiErrorGenerator'
import { contentsWrapper } from '../../lib/contentsWrapper'
import { apiResponser } from '../../lib/middleware/apiResponser'

/**
 * @description 글 및 유저 검색
 * @access GET /search?type=[User/Board]&q=QUERY
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns 검색 결과 array
 */
export const search = async (req, res, next) => {
  const { q: queryString, type: searchType } = req.query

  let searchResult

  if (searchType === 'Board') {
    // 글 제목으로 검색
    try {
      searchResult = await boardDAO.searchByTitleOrTag(queryString)
    } catch (e) {
      return next(apiErrorGenerator(500, '글 검색에 실패했습니다.', e))
    }
  } else if (searchType === 'User') {
    // 유저 screenId/닉네임으로 검색
    try {
      searchResult =
        queryString[0] === '@'
          ? await userDAO.searchByScreenId(queryString.substr(1))
          : await userDAO.searchByNickname(queryString)
    } catch (e) {
      return next(apiErrorGenerator(500, '유저 검색에 실패했습니다.', e))
    }
  }

  return apiResponser({
    req,
    res,
    data: req.user.id
      ? await contentsWrapper(req.user.id, searchResult, searchType, false)
      : searchResult,
  })
}
