const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const feedback = new mongoose.Schema({
  uid: { type: ObjectId, required: true },
  buid: { type: ObjectId, required: true },
  replyBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  childCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
});

// Create
feedback.statics.create = function (data, session, cb) {
  const replyData = new this(data);
  return replyData.save(session, cb);
};

// Read
feedback.statics.getRepliesByBoardId = function (boardId, cb) {
  return this.find({ buid: boardId }, cb);
};

feedback.statics.getBody = function (replyId, cb) {
  return this.findOne({ _id: replyId }, { _id: 0, replyBody: 1 }, cb);
};

// Auth
feedback.statics.isWriter = function (uid, replyId, cb) {
  return this.findOne({ _id: replyId, uid: uid }, cb);
};

// Update
feedback.statics.update = async function ({replyId, newReplyBody}, cb) {
  this.updateOne(
    { _id: replyId },
    {
      replyBody: newReplyBody,
      edited: true,
    },
    cb
  );
};

// Delete
feedback.statics.delete = function (replyId, cb) {
  return this.deleteOne({ _id: replyId }, cb);
};

feedback.statics.deleteByBoardId = function (boardId, cb) {
  return this.deleteMany({ boardId }, cb)
}

// Counting 추가 필요

module.exports = mongoose.model("Reply", feedback);
