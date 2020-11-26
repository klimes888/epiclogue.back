import { React } from '../../../models'
/* 
  This is react router.
  base url: /boards/:boardId/react
  OPTIONS: GET
*/

export const getReact = async (req, res, next) => {
  try {
    const reactData = await React.getByBoardId(req.params.boardId)
    const filteredData = reactData.filter(data => {
      return data.user !== null
    })
    console.log(`[INFO] 유저 ${res.locals.uid} 가 글 ${req.params.boardId} 의 반응내역을 확인합니다.`)
    return res.status(200).json({
      result: 'ok',
      data: filteredData,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'))
  }
}
