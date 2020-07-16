const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const reply = new mongoose.Schema({
  uid: { type: ObjectId, required: true },
  buid: { type: ObjectId, default: null },
  replyBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  parentId: { type: ObjectId, default: null },
});

// Create
reply.statics.create = function (data, cb) {
  const replyData = new this(data);
  return replyData.save(cb);
};

reply.statics.createReplyOnReply = function (replyOnReplyInput, cb) {
  const replyOnReplyData = new this({
    uid: replyOnReplyInput.uid,
    buid: replyOnReplyInput.buid,
    replyBody: replyOnReplyInput.replyBody,
    parentId: replyOnReplyInput.parentId,
  });

  replyOnReplyData.save(cb);
};
// Read
reply.statics.getRepliesByBoardId = function (boardId) {
  return this.find({ buid: boardId });
};

reply.statics.getRepliesByParentId = function (replyId) {
  return this.find({ parentId: replyId });
};

reply.statics.isWriter = function (uid, replyId) {
  return this.findOne({ _id: replyId, uid: uid });
};

// Update
reply.statics.updateReply = async function (newReplyData, cb) {
  this.updateOne(
    { _id: newReplyData.replyId },
    {
      replyBody: newReplyData.newReplyBody,
      edited: true,
    },
    cb
  );
};

// Delete
reply.statics.removeReply = function (replyId, cb) {
  return this.deleteOne({ _id: replyId }, cb);
};

module.exports = mongoose.model("Reply", reply);
