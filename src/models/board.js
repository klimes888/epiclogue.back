import mongoose from 'mongoose'
const ObjectId = mongoose.ObjectId

const board = new mongoose.Schema({
  writer: { type: ObjectId, ref: 'User' },
  boardTitle: { type: String, default: '' },
  boardImg: { type: [String], required: true },
  boardBody: { type: String, default: '' },
  category: { type: String, enum: [0, 1], default: 0 }, // [on future] 0: Illust, 1: Comic
  pub: { type: Number, enum: [0, 1], default: 1 }, // 0: private, 1: public
  writeDate: { type: Date, default: Date.now },
  language: { type: String, default: 0 }, // [on future] 0: Korean, 1: Japanese, 2: US, 3: China, 4: Taiwan
  allowSecondaryCreation: { type: Number, default: 1 }, // 0: not allow, 1: allow, 2: only allow on followers
  feedbacks: [{ type: ObjectId, ref: 'Feedback' }],
  heartCount: { type: Number, default: 0 },
  feedbackCount: { type: Number, default: 0 },
  bookmarkCount: { type: Number, default: 0 },
  reactCount: { type: Number, default: 0 },
  tags: { type: [String] },
  originUserId: { type: ObjectId },
  originBoardId: { type: ObjectId },
  edited: { type: Boolean, default: false },
})

board.statics.create = function (data) {
  const boardData = new this(data)

  return boardData.save()
}

board.statics.getById = function (boardId, option) {
  return this.findOne({ _id: boardId }, option || { __v: 0 })
    .populate({
      path: 'feedbacks',
      select: '-replies',
      populate: { path: 'writer', select: '_id screenId nickname profile' },
    })
    .populate({ path: 'writer', select: '_id screenId nickname profile' })
}

/* 특정 유저의 글 GET (미검증) */

board.statics.getUserArticleList = function (userId) {
  return this.find({ uid: userId })
}

board.statics.isWriter = function (userId, boardId) {
  return this.findOne({ _id: boardId, writer: userId })
}

board.statics.update = function (articleData, session) {
  return this.updateOne(
    { _id: articleData.boardId },
    {
      boardTitle: articleData.boardTitle,
      boardBody: articleData.boardBody,
      boardImg: articleData.boardImg,
      category: articleData.category,
      pub: articleData.pub,
      language: articleData.language,
      edited: true,
    },
    { session }
  )
}

board.statics.delete = function (buid) {
  return this.deleteOne({ _id: buid })
}

/* 글 전체 조회 */
board.statics.findAll = function (option) {
  // uid를 이용해 유저 닉네임을 응답데이터에 넣어야하는데 어떻게 넣어야 효율적일지 고민이 필요
  return this.find(
    option,
    {
      _id: 1,
      writer: 1,
      boardTitle: 1,
      uid: 1,
      pub: 1,
      category: 1,
      boardImg: 1,
    }
  ).sort({ writeDate: 1, heartCount: 1 })
  .populate({
    path: 'writer',
    // match: { deactivatedAt: { $type: 10 } }, // BSON type: 10 is null value. 
    select: '_id screenId nickname profile',
  })
}

board.statics.findAllSecondaryWorks = function (userId) {
  return this.find(
    { writer: userId, originUserId: { $exists: true } },
    {
      _id: 1,
      writer: 1,
      boardTitle: 1,
      uid: 1,
      pub: 1,
      category: 1,
      boardImg: 1,
    }
  ).populate({
    path: 'writer',
    select: '_id screenId nickname profile',
  })
}

board.statics.getFeedback = function (boardId, feedbackId) {
  return this.updateOne({ _id: boardId }, { $push: { feedbacks: feedbackId } })
}

board.statics.getTitlesByQuery = function (query) {
  return this.find(
    { boardTitle: { $regex: query } },
    {
      boardTitle: 1,
    }
  ).sort({ boardTitle: 'asc' })
}

board.statics.getByQuery = function (query) {
  return this.find(
    { $or: [{ boardTitle: { $regex: query } }, { tags: query }] },
    {
      _id: 1,
      boardTitle: 1,
      uid: 1,
      pub: 1,
      category: 1,
      boardImg: 1,
    }
  ).sort({ writeDate: 1, heartCount: 1 })
  .populate({
    path: 'writer',
    select: '_id screenId nickname profile',
  })
}

board.statics.countFeedback = function (boardId, flag) {
  const increment = flag ? 1 : -1
  return this.updateOne({ _id: boardId }, { $inc: { feedbackCount: increment } })
}

board.statics.countBookmark = function (boardId, flag) {
  const increment = flag ? 1 : -1
  return this.updateOne({ _id: boardId }, { $inc: { bookmarkCount: increment } })
}

board.statics.getBookmarkCount = function (boardId) {
  return this.findOne({ _id: boardId }, { _id: 0, bookmarkCount: 1 })
}

board.statics.countHeart = function (boardId, flag) {
  const increment = flag ? 1 : -1
  return this.updateOne({ _id: boardId }, { $inc: { heartCount: increment } })
}

board.statics.getHeartCount = function (boardId) {
  return this.findOne({ _id: boardId }, { heartCount: 1, _id: 0 })
}

board.statics.countReact = function (boardId, flag) {
  const increment = flag ? 1 : -1
  return this.updateOne({ _id: boardId }, { $inc: { reactCount: increment } })
}

export default mongoose.model('Board', board)
