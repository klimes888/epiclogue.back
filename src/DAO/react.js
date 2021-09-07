import { React } from '../models'

export const create = function (data) {
  const reactData = new React(data)
  return reactData.save()
}

export const deleteReact = function (user, boardId) {
  return React.deleteOne({ user, boardId })
}

export const getByBoardId = function (boardId) {
  return React.find(
    { boardId },
    {
      _id: 0,
      __v: 0,
      boardId: 0,
    }
  ).populate({ path: 'user', select: '_id screenId nickname profile' })
}

export const countReacts = function (boardId) {
  return React.countDocuments({ boardId })
}
