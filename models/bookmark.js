const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const Bookmark = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  boardId: { type: ObjectId, required: true },
  craeteAt: { type: Date, default: Date.now },
});

Bookmark.statics.create = function (data) {
  const bookmarkData = new this(data);
  return bookmarkData.save();
};

Bookmark.static.delete = function (bookmarkData) {
  return this.deleteOne({
    userId: bookmarkData.userId,
    boardId: bookmarkData.boardId,
  });
};

// 유저의 북마크 목록
Bookmark.statics.getByUserId = function (userId) {
  return this.find({ userId });
};

module.exports = mongoose.model("Bookmark", Bookmark);
