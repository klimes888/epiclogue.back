import mongoose from 'mongoose'
const ObjectId = mongoose.ObjectId

const Bookmark = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  board: { type: ObjectId, required: true, ref: 'Board' },
  craeteAt: { type: Date, default: Date.now },
})

Bookmark.statics.create = function (data) {
  const bookmarkData = new this(data)
  return bookmarkData.save()
}

Bookmark.statics.delete = function (userId, boardId) {
  return this.deleteOne({ userId, boardId })
}

// 유저의 북마크 목록
Bookmark.statics.getByUserId = function (userId) {
  return this.find({ userId }).populate({ path: 'board', select: '_id boardTitle boardImg. pub category' })
}

export default mongoose.model('Bookmark', Bookmark)
