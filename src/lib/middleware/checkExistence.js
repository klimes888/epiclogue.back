import { User, Board, Reply, Feedback } from '../../models'

// to patch, delete, like, bookmark on board, feedback, reply
export const checkExistence = async (req, res, next) => {
  let type
  let targetId
  let existence
  try {
    // 게시 타입에 따라 분류 후 처리
    if (req.params.replyId !== undefined || req.body.targetType === 'reply') {
      targetId = req.params.replyId || req.body.targetId
      existence = await Reply.getById(targetId)
    } else if (req.params.feedbackId !== undefined || req.body.targetType === 'feedback') {
      targetId = req.params.feedbackId || req.body.targetId
      existence = await Feedback.getById(targetId)
    } else {
      // 글 수정 또는 북마크, 좋아요
      targetId = req.params.boardId || req.body.boardId || req.body.targetId
      existence = await Board.getById(targetId)
    }

    if (existence !== null) {
      next()
    } else {
      console.error(
        `[WARN] 유저 ${res.locals.uid}가 존재하지 않는 ${type} ${targetId} 를 접근하려 했습니다.`
      )
      return res.status(404).json({
        result: 'error',
        message: '존재하지 않는 데이터입니다.',
      })
    }
  } catch (e) {
    console.error(`[ERROR] 게시글 존재 여부를 확인하는 중에 문제가 발생 했습니다. ${e}`)
    return res.status(500).json({
      result: 'error',
      message: '알 수 없는 오류가 발생했습니다.',
    })
  }
}

// for follow, DM, mute, block
export const checkUserExistence = async (req, res, next) => {
  const userId = req.body.targetUserId || await User.getIdByScreenId(req.params.screenId)

  try {
    const existence = await User.getById(userId)
    console.log(existence._id, res.locals.uid)
    if (existence !== null) {
      // left is Object, right is String.
      if (existence._id.toString() === res.locals.uid) {
        return res.status(400).json({
          result: 'error',
          message: '적절하지 않은 접근입니다.',
        })
      } else {
        next()
      }
    } else {
      console.error(
        `[WARN] 유저 ${res.locals.uid}가 존재하지 않는 유저 ${userId} 에게 접근하려 했습니다.`
      )
      return res.status(404).json({
        result: 'error',
        message: '존재하지 않는 데이터입니다.',
      })
    }
  } catch (e) {
    console.error(`[ERROR] 유저 존재 여부를 확인하는 중에 문제가 발생 했습니다. ${e}`)
    return res.status(500).json({
      result: 'error',
      message: '알 수 없는 오류가 발생했습니다.',
    })
  }
}

/* guarantee to have 0 or 1 (bookmark, like, follow, mute, block)
 * 0. check type
 * 1. check DB
 * 2. return result
 * */
export const checkUnique = async (req, res, next) => {
  try {
  } catch (e) {
    console.error(`[ERROR] 데이터 유일성을 확인하는 중에 문제가 발생 했습니다. ${e}`)
    return res.status(500).json({
      result: 'error',
      message: '알 수 없는 오류가 발생했습니다.',
    })
  }
}
