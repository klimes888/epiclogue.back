const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const ReplyOnReply = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  parentId: { type: ObjectId, required: true },
  body: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
});

// Create
ReplyOnReply.statics.create = function (data, cb) {
  const ReplyOnReplyData = new this(data);
  return ReplyOnReplyData.save(cb);
};

// Auth
ReplyOnReply.statics.isWriter = function (userId, repliesOnReplyId, cb) {
  return this.findOne({ _id: repliesOnReplyId, userId: userId }, cb);
};

// Read
ReplyOnReply.statics.getByParentId = function (parentId, cb) {
  return this.find({ parentId }, cb);
};

ReplyOnReply.statics.getBody = function (repliesOnReplyId, cb) {
  return this.findOne({ _id: repliesOnReplyId }, { _id: 0, body: 1 }, cb);
};

// Update
ReplyOnReply.statics.update = async function (updateForm, cb) {
  return this.updateOne(
    { _id: updateForm.repliesOnReplyId },
    {
      body: updateForm.newBody,
      edited: true,
    },
    cb
  );
};

// Delete
ReplyOnReply.statics.delete = function (repliesOnReplyId, cb) {
  return this.deleteOne({ _id: repliesOnReplyId }, cb);
};

// Delete all
ReplyOnReply.statics.deleteByParentId = function (parentId, cb) {
  return this.deleteMany({ parentId }, cb);
};

module.exports = mongoose.model("RepliesOnReply", ReplyOnReply);
