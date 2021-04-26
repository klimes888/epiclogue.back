import { Board } from '../models'

export const create = async data => Board.create(data)

export const getById = async function (boardId, option) {
  return Board.findOne({ _id: boardId }, option || { __v: 0 })
    .populate({ path: 'writer', select: '_id screenId nickname profile' })
    .populate({ path: 'originUserId', select: '_id screenId nickname profile' })
    .populate({ path: 'originBoardId', select: '_id boardTitle boardBody boardImg' })
}

export const getWriter = async boardId => Board.findOne({ _id: boardId }, { writer: 1 })

/* 특정 유저의 글 GET (미검증) */

export const getUserArticleList = function (userId) {
  return Board.find({ uid: userId })
}

export const isWriter = function (userId, boardId) {
  return Board.findOne({ _id: boardId, writer: userId })
}

export const update = function (articleData) {
  return Board.findOneAndUpdate(
    { _id: articleData.boardId },
    {
      boardTitle: articleData.boardTitle,
      boardBody: articleData.boardBody,
      boardImg: articleData.boardImg,
      category: articleData.category,
      pub: articleData.pub,
      language: articleData.language,
      edited: true,
      tags: articleData.tags,
    },
    {
      new: true,
    }
  )
}

export const deleteBoard = function (buid) {
  return Board.deleteOne({ _id: buid })
}

/* 글 전체 조회 */
export const findAll = function (option) {
  // uid를 이용해 유저 닉네임을 응답데이터에 넣어야하는데 어떻게 넣어야 효율적일지 고민이 필요
  return Board.find(option, {
    _id: 1,
    writer: 1,
    boardTitle: 1,
    uid: 1,
    pub: 1,
    language: 1,
    category: 1,
    thumbnail: 1,
    originUserId: 1,
  })
    .sort({ writeDate: -1 })
    .populate({
      path: 'writer',
      // match: { deactivatedAt: { $type: 10 } }, // BSON type: 10 is null value.
      select: '_id screenId nickname profile',
    })
}

export const getFeed = function (option, size) {
  // 들어오는 id를 기준으로 이후 size만큼 반환
  return Board.find(option, {
    _id: 1,
    writer: 1,
    boardTitle: 1,
    uid: 1,
    pub: 1,
    language: 1,
    category: 1,
    thumbnail: 1,
    originUserId: 1,
  })
    .limit(size)
    .sort({ writeDate: -1 })
    .populate({
      path: 'writer',
      select: '_id screenId nickname profile',
    })
}

export const findAllOriginOrSecondary = function (userId, isExists) {
  return Board.find(
    { writer: userId, originUserId: { $exists: isExists } },
    {
      _id: 1,
      writer: 1,
      boardTitle: 1,
      uid: 1,
      pub: 1,
      category: 1,
      thumbnail: 1,
    }
  ).populate({
    path: 'writer',
    select: '_id screenId nickname profile',
  })
}

export const getTitlesByQuery = function (query) {
  return Board.find(
    { boardTitle: { $regex: query } },
    {
      boardTitle: 1,
    }
  ).sort({ boardTitle: 'asc' })
}

export const searchByTitleOrTag = function (query, size = 35, latestId, category) {
  const option = {
    $or: [{ boardTitle: { $regex: query } }, { tags: query }],
    pub: 1,
  }
  if(latestId) {
    option._id = { $lt: latestId }
  }
  if(category) {
    option.category = category
  }
  return Board.find(
    option,
    {
      _id: 1,
      boardTitle: 1,
      uid: 1,
      pub: 1,
      category: 1,
      thumbnail: 1,
    }
  )
    .sort({ writeDate: -1 })
    .limit(size)
    .populate({
      path: 'writer',
      select: '_id screenId nickname profile',
    })
}

export const countByWriterAndCategory = function (userId, category) {
  // 0: Illust, 1: Comic
  return Board.countDocuments({ writer: userId, category })
}

export const createSec = async boardData => Board.create(boardData)

export const getSecondaryAllow = async boardId =>
  Board.findOne({ _id: boardId }, { allowSecondaryCreation: 1 })
