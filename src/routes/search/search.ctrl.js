import createError from 'http-errors'
import { User, Board, Follow } from '../../models'
import { contentsWrapper } from '../../lib/contentsWrapper'

/* 검색 화면 렌더링을 가정한 데이터 API */
export const searchResult = async (req, res, next) => {
  const { q: queryString, type: searchType } = req.query

  let searchResult

  if (searchType === 'Board') {    // 글 제목으로 검색
    try {
      searchResult = await Board.searchByTitleOrTag(queryString)
    } catch (e) {
      console.error(e)
      return next(createError('글 검색에 실패했습니다.'))
    }
  } else if (searchType === 'User') { // 유저 screenId/닉네임으로 검색
    try {
      searchResult =
        queryString[0] === '@'
          ? await User.searchByScreenId(queryString.substr(1))
          : await User.searchByNickname(queryString)
    } catch (e) {
      console.error(e)
      return next(createError('유저 검색에 실패했습니다.'))
    }
  }

  return res.status(200).json({
    result: 'ok',
    data: await contentsWrapper(res.locals.uid, searchResult, searchType, false)
  })
}
