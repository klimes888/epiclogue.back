import { Board, Reply, Feedback } from '../../models'

// 작성자에 대한 인증 미들웨어
export const checkWriter = async (req, res, next) => {
  let isWriter = null
  let type
  let id

  try {
    // 검사 전에 해당 게시물(댓글, 피드백, 글)이 존재하는지 먼저 검사하지 않으면 auth error 발생
    if (req.params.replyId !== undefined) {
      type = '댓글'
      id = req.params.replyId
      isWriter = await Reply.isWriter(res.locals.uid, req.params.replyId)
    } else if (req.params.feedbackId !== undefined) {
      type = '피드백'
      id = req.params.feedbackId
      isWriter = await Feedback.isWriter(res.locals.uid, req.params.feedbackId)
    } else if (req.params.boardId !== undefined) {
      type = '글'
      id = req.params.boardId
      isWriter = await Board.isWriter(res.locals.uid, req.params.boardId)
    }

    if (isWriter !== null) {
      next()
    } else {
      console.log(`[Auth error] user: ${res.locals.uid}, ${type} id: ${id}`)
      return res.status(401).json({
        result: 'error',
        message: `${type} 작성자가 아닙니다.`,
      })
    }
  } catch (e) {
    console.error(`[Error!] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}
