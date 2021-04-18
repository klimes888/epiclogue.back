import { reactDAO } from '../../../DAO'
import { apiErrorGenerator } from '../../../lib/apiErrorGenerator'
import { apiResponser } from '../../../lib/middleware/apiResponser'

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
    const reactData = await reactDAO.getByBoardId(req.params.boardId)
    const filteredData = reactData.filter(data => data.user !== null)

    return apiResponser({ req, res, data: filteredData })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 오류가 발생했습니다.', e))
  }
}
