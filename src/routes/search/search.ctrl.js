import createError from 'http-errors';
import { User, Board } from '../../models';
import { contentsWrapper } from '../../lib/contentsWrapper';

/**
 * @description 글 및 유저 검색
 * @access GET /search?type=[User/Board]&q=QUERY
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns 검색 결과 array
 */
export const search = async (req, res, next) => {
  const { q: queryString, type: searchType } = req.query;

  let searchResult;

  if (searchType === 'Board') {
    // 글 제목으로 검색
    try {
      searchResult = await Board.searchByTitleOrTag(queryString);
    } catch (e) {
      console.error(e);
      return next(createError('글 검색에 실패했습니다.'));
    }
  } else if (searchType === 'User') {
    // 유저 screenId/닉네임으로 검색
    try {
      searchResult =
        queryString[0] === '@'
          ? await User.searchByScreenId(queryString.substr(1))
          : await User.searchByNickname(queryString);
    } catch (e) {
      console.error(e);
      return next(createError('유저 검색에 실패했습니다.'));
    }
  }

  console.log(`[INFO] 유저 ${res.locals.uid} 가 ${searchType} ${queryString} 을 검색했습니다.`);
  return res.status(200).json({
    result: 'ok',
    data: res.locals.uid
      ? await contentsWrapper(res.locals.uid, searchResult, searchType, false)
      : searchResult,
  });
};
