import { React } from '../../../models'
/* 
  This is react router.
  base url: /boards/:boardId/react
  OPTIONS: GET
*/

export const getReact = async (req, res, next) => {
  try {
    const reactData = await React.getByBoardId(req.params.boardId)

    console.log(`[INFO] 유저 ${res.locals.uid} 가 글 ${req.params.boardId} 의 반응내역을 확인합니다.`)
    return res.status(200).json({
      result: 'ok',
      data: reactData,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}
