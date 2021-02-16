import createError from 'http-errors';
import { React } from '../../../models';

/**
 * @description 글의 반응 확인
 * @access GET /boards/:boardId/react
 * @param {*} req - HTTP Requset
 * @param {*} res - HTTP Response
 * @param {*} next - Express next middleware
 * @returns 반응 리스트
 */
export const getReact = async (req, res, next) => {
  try {
    const reactData = await React.getByBoardId(req.params.boardId);
    const filteredData = reactData.filter(data => data.user !== null);
    console.log(
      `[INFO] 유저 ${res.locals.uid || '비회원유저'} 가 글 ${
        req.params.boardId
      } 의 반응내역을 확인합니다.`
    );
    return res.status(200).json({
      result: 'ok',
      data: filteredData,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'));
  }
};
