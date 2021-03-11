import { startSession } from 'mongoose'
import { Feedback, Board } from '../models'

// Create
export const createAndGetNewList = async function (boardId, feedbackData) {
  let newerFeedbacks
  let postFeedbackResult
  let targetData
  const session = await startSession()
  try {
    await session.withTransaction(async () => {
      [postFeedbackResult] = await Feedback.create([feedbackData], { session })
      targetData = await Board.findOne({ _id: boardId }, { writer: 1 }).session(session)
      newerFeedbacks = await getByBoardId(boardId).session(session)
    })
  } catch (e) {
    throw new Error(`Error in Feedback Transaction ${e}`)
  } finally {
    session.endSession()
  }
  return {
    postFeedbackResult,
    targetData,
    newerFeedbacks,
  }
}

// Read
export const getByBoardId = function (boardId) {
  return Feedback.find(
    { boardId },
    {
      __v: 0,
    }
  ).populate({ path: 'writer', select: '_id screenId nickname profile' })
}

export const getBody = function (feedbackId) {
  return Feedback.findOne({ _id: feedbackId }, { _id: 0, feedbackBody: 1 })
}

// Auth
export const isWriter = function (userId, feedbackId) {
  return Feedback.findOne({ _id: feedbackId, writer: userId })
}

// Update
export const updateAndGetNewList = async function (boardId, newFeedbackData) {
  let newerFeedbacks
  const session = await startSession()
  try {
    await session.withTransaction(async () => {
      await Feedback.updateOne(
        { _id: newFeedbackData.feedbackId },
        {
          feedbackBody: newFeedbackData.newFeedbackBody,
          edited: true,
        },
        { session }
      )
      newerFeedbacks = await getByBoardId(boardId).session(session)
    })
  } catch (e) {
    throw new Error(`Error in Feedback Transaction ${e}`)
  } finally {
    session.endSession()
  }

  return newerFeedbacks
}

// Delete
export const deleteFeedbackAndGetNewList = async function (feedbackId, boardId) {
  let newerFeedbacks
  const session = await startSession()
  try {
    await session.withTransaction(async () => {
      await Feedback.deleteOne({ _id: feedbackId }).session(session)
      newerFeedbacks = await getByBoardId(boardId).session(session)
    })
  } catch (e) {
    throw new Error(`Error in Feedback Transaction ${e}`)
  } finally {
    session.endSession()
  }
  return newerFeedbacks
}

export const deleteByBoardId = function (boardId) {
  return Feedback.deleteMany({ boardId })
}

export const getById = function (feedbackId, option) {
  return Feedback.findOne({ _id: feedbackId }, option)
}

export const getWriter = async feedbackId => Feedback.findOne({ _id: feedbackId }, { writer: 1 })
