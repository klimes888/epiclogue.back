import { Board } from '../models'

export const create = async data => {
  let result
  try {
    result = await Board.create(data)
  } catch (e) {
    throw new Error('error when create board')
  }

  return result
}

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

export const deleteBoard = async function (buid) {
  const data = await Board.findByIdAndDelete(buid)
  return data.boardTitle
}

/* 글 전체 조회 */
export const findAll = function (writer, latestId, size) {
  const query = {
    writer,
  }
  if (latestId) {
    query._id = { $lt: latestId }
  }
  return Board.find(query, {
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
    .limit(size)
    .populate({
      path: 'writer',
      // match: { deactivatedAt: { $type: 10 } }, // BSON type: 10 is null value.
      select: '_id screenId nickname profile',
    })
}

export const getFeed = function (requestType, latestId, size) {
  const query = {
    pub: 1,
    isBlind: false
  }
  // 특정 카테고리만 요청할 경우
  if (requestType) {
    query.category = requestType === 'Illust' ? 0 : 1
  }

  if (latestId) {
    query._id = { $lt: latestId }
  }
  // 들어오는 id를 기준으로 이후 size만큼 반환
  return Board.find(query, {
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

export const findAllOriginOrSecondary = function (userId, isExists, latestId, size) {
  const query = {
    writer: userId,
    originUserId: { $exists: isExists },
  }
  if (latestId) {
    query._id = { $lt: latestId }
  }
  return Board.find(query, {
    _id: 1,
    writer: 1,
    boardTitle: 1,
    uid: 1,
    pub: 1,
    category: 1,
    thumbnail: 1,
  })
    .sort({ writeDate: -1 })
    .limit(size)
    .populate({
      path: 'writer',
      select: '_id screenId nickname profile',
    })
}

export const getTitlesByQuery = function (query) {
  return Board.find(
    { 
      boardTitle: { $regex: query },
      pub: 1,
      isBlind: false
    },
    {
      boardTitle: 1,
    }
  ).sort({ boardTitle: 'asc' })
}

export const searchByTitleOrTag = function (query, size = 35, latestId, category) {
  const option = {
    $or: [{ boardTitle: { $regex: query } }, { tags: query }],
    pub: 1,
    isBlind: false
  }
  if (latestId) {
    option._id = { $lt: latestId }
  }
  if (category) {
    option.category = category === 'Comic' ? 1 : 0
  }
  return Board.find(option, {
    _id: 1,
    boardTitle: 1,
    uid: 1,
    pub: 1,
    category: 1,
    thumbnail: 1,
  })
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

export const getSecondaryAllow = async boardId =>
  Board.findOne({ _id: boardId }, { allowSecondaryCreation: 1 })

export const setBlind = async boardId => {
  const data = await Board.findByIdAndUpdate(boardId, { $set: { isBlind: true } })
  return data.boardTitle
}

export const unsetBlind = async boardId => {
  const data = await Board.findByIdAndUpdate(boardId, { $set: { isBlind: false } })
  return data.boardTitle
}