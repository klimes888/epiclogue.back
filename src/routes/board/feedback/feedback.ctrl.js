import { Board, Feedback } from '../../../models'

/*
  This is reply router.
  Base url: /boards/{board-id}/feedback
*/

export const postFeedback = async (req, res, next) => {
  const feedbackData = {
    writer: res.locals.uid,
    boardId: req.params.boardId,
    feedbackBody: req.body.feedbackBody,
  }

  try {
    const postFeedbackResult = await Feedback.create(feedbackData)
    console.log(`[INFO] 유저 ${res.locals.uid} 가 피드백 ${postFeedbackResult._id} 을 작성했습니다.`)
    await Board.getFeedback(req.params.boardId, postFeedbackResult._id)
    const newerData = await Feedback.getByBoardId(req.params.boardId)
    return res.status(201).json({
      result: 'ok',
      data: newerData,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}

export const editFeedback = async (req, res, next) => {
  const newForm = {
    feedbackId: req.params.feedbackId,
    newFeedbackBody: req.body.newFeedbackBody,
  }

  try {
    const patch = await Feedback.update(newForm)

    if (patch.ok === 1) {
      const newerData = await Feedback.getByBoardId(req.params.boardId)
      if (patch.n === 1) {
        console.log(`[INFO] 피드백 ${req.params.feedbackId} 가 정상적으로 수정되었습니다.`)
        return res.status(200).json({
          result: 'ok',
          data: newerData,
        })
      } else if (patch.n === 0) {
        console.error(
          `[ERROR] 피드백 ${req.params.feedbackId} 가 존재하지않아 수정되지 않았습니다.`
        )
        return res.status(404).json({
          result: 'error',
          data: newerData,
          message: '존재하지 않는 데이터에 접근했습니다.',
        })
      }
    } else {
      console.error(
        `[ERROR] 피드백 ${req.params.feedbackId} 의 수정이 정상적으로 처리되지 않았습니다.`
      )
      return res.status(500).json({
        result: 'error',
        message: '예기치 않은 문제가 발생했습니다.',
      })
    }
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}

export const deleteFeedback = async (req, res, next) => {
  try {
    const deletion = await Feedback.delete(req.params.feedbackId)
    if (deletion.ok === 1) {
      const newerData = await Feedback.getByBoardId(req.params.boardId)
      if (deletion.n === 1) {
        console.log(`[INFO] 피드백 ${req.params.feedbackId} 가 정상적으로 삭제되었습니다.`)
        return res.status(200).json({
          result: 'ok',
          data: newerData,
        })
      } else if (result.n === 0) {
        console.log(`[ERROR] 피드백 ${req.params.feedbackId} 가 존재하지 않아 삭제되지 않았습니다.`)
        return res.status(404).json({
          result: 'error',
          data: newerData,
          message: '존재하지 않는 데이터에 접근했습니다.',
        })
      }
    } else if (result.ok === 0) {
      console.error(
        `[ERROR] 피드백 ${req.params.feedbackId} 의 삭제가 정상적으로 처리되지 않았습니다.`
      )
      res.status(500).json({
        result: 'error',
        message: '예기치 않은 문제가 발생했습니다.',
      })
    }
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}

export const getFeedback = async (req, res, next) => {
  try {
    const feedbackData = await Feedback.getById(req.params.feedbackId)
    console.log(`[INFO] 유저 ${feedbackData.writer} 가 피드백 ${feedbackData._id} 를 조회했습니다.`)
    return res.status(200).json({
      result: 'ok',
      data: feedbackData
    })
  } catch (e) {
    console.log(`[ERROR] ${e.message}`)
    return res.status(500).json({
      result: 'error',
      message: 'Internal server error occured'
    })
  }
}