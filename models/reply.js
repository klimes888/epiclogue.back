const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const Reply = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  boardId: { type: ObjectId, required: true },
  parentId: { type: ObjectId, required: true },
  replyBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  heartCount: { type: Number, default: 0 },
});

// Create
Reply.statics.create = function (data, cb) {
  const ReplyData = new this(data);
  return ReplyData.save(cb);
};

// Auth
Reply.statics.isWriter = function (userId, replyId, cb) {
  return this.findOne({ _id: replyId, userId: userId }, cb);
};

// Read
Reply.statics.getByParentId = function (parentId, cb) {
  return this.find({ parentId }, cb);
};

Reply.statics.getBody = function (replyId, cb) {
  return this.findOne({ _id: replyId }, { _id: 0, replyBody: 1 }, cb);
};

// Update
Reply.statics.update = async function (updateForm, cb) {
  return this.updateOne(
    { _id: updateForm.replyId },
    {
      replyBody: updateForm.newReplyBody,
      edited: true,
    },
    cb
  );
};

// Delete
Reply.statics.delete = function (replyId, cb) {
  return this.deleteOne({ _id: replyId }, cb);
};

// Delete all
Reply.statics.deleteByBoardId = function (boardId, cb) {
  return this.deleteMany({ boardId }, cb);
};

Reply.statics.deleteByParentId = function (parentId, cb) {
  return this.deleteMany({ parentId }, cb);
};

Reply.statics.getById = function (id, cb) {
  return this.findOne({ _id: id }, cb);
};

// Counting

module.exports = mongoose.model("Reply", Reply);
