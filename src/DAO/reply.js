import { startSession } from 'mongoose'
import { Reply } from '../models'

// Create
export const createAndGetNewList = async function (replyForm) {
  let newerReplies
  const session = await startSession()
  try {
    await session.withTransaction(async () => {
      await Reply.create([replyForm], { session })
      newerReplies = await getByParentId(replyForm.parentId).session(session)
    })
  } catch (e) {
    throw new Error(`Error in Reply Transaction ${e}`)
  } finally {
    session.endSession()
  }
  return newerReplies
}

// Read
export const getByParentId = function (parentId) {
  return Reply.find({ parentId }, { __v: 0, boardId: 0, parentId: 0 }).populate({
    path: 'writer',
    select: 'nickname screenId profile',
  })
}

export const getBody = function (replyId) {
  return Reply.findOne({ _id: replyId }, { _id: 0, replyBody: 1 })
}

// Update
export const updateAndGetNewList = async function (feedbackId, updateForm) {
  let newerData
  const session = await startSession()
  try {
    await session.withTransaction(async () => {
      await Reply.updateOne(
        { _id: updateForm.replyId },
        {
          replyBody: updateForm.newReplyBody,
          edited: true,
        },
        { session }
      )
      newerData = await getByParentId(feedbackId).session(session)
    })
  } catch (e) {
    throw new Error(`Error in Reply Transaction ${e}`)
  } finally {
    session.endSession()
  }
  return newerData
}

// Delete
export const deleteReplyAndGetNewList = async function (replyId, parentId) {
  await Reply.deleteOne({ _id: replyId })
  const result = await getByParentId(parentId)
  return result
}

// Delete all
export const deleteByBoardId = function (boardId) {
  return Reply.deleteMany({ boardId })
}

export const deleteByParentId = function (parentId) {
  return Reply.deleteMany({ parentId })
}

export const deleteById = async replyId => {
  const data = Reply.findByIdAndDelete(replyId)
  return data.replyBody
}

export const getById = function (replyId, option) {
  return Reply.findOne({ _id: replyId }, option)
}

export const getParentId = function (replyId) {
  return Reply.findOne({ _id: replyId }, { parentId: 1 })
}

export const countReplys = async parentId => Reply.countDocuments({ parentId })

export const isWriter = function (userId, replyId) {
  return Reply.findOne({ _id: replyId, writer: userId })
}

export const setBlind = async replyId => Reply.findByIdAndUpdate(replyId, { $set: { isBlind: true } })

export const unsetBlind = async replyId => Reply.findByIdAndUpdate(replyId, { $set: { isBlind: false } })