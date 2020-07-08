const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const book = new mongoose.Schema({
  uid: { type: String, required: true },
  boardUid: { type: String, required: true },
});

book.statics.create = function (data) {
  const bookmarkData = new this(data);
  return bookmarkData.save();
};

book.static.removeBookmark = function (bookId) {
  return this.deleteOne({ _id: bookId });
};

// 유저의 북마크 목록
book.statics.bookmarkList = function (userId) {
  return this.find({ uid: userId });
};

module.exports = mongoose.model("Book", book);
