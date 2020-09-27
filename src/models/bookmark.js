import mongoose from 'mongoose'
const ObjectId = mongoose.ObjectId

const Bookmark = new mongoose.Schema({
  user: { type: ObjectId, required: true },
  board: { type: ObjectId, required: true, ref: 'Board' },
  craeteAt: { type: Date, default: Date.now },
})

Bookmark.statics.create = function (data) {
  const bookmarkData = new this({
    user: data.user,
    board: data.boardId,
    createdAt: Date.now()
  })
  return bookmarkData.save()
}

Bookmark.statics.delete = function (user, boardId) {
  return this.deleteOne({ user, board: boardId })
}

// 유저의 북마크 목록
Bookmark.statics.getByUserId = function (user) {
  return this.find({ user }).populate({ path: 'board', select: '_id boardTitle boardImg. pub category' })
}

Bookmark.statics.didBookmark = function (user, board) {
  return this.findOne({ user, board })
}

export default mongoose.model('Bookmark', Bookmark)
