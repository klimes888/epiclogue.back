const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const reply = new mongoose.Schema({
  uid: { type: ObjectId, required: true },
  buid: { type: ObjectId, required: true },
  body: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  childCount: { type: Number, default: 0 },
});

// Create
reply.statics.create = function (data, session, cb) {
  const replyData = new this(data);
  return replyData.save(session, cb);
};

// Read
reply.statics.getRepliesByBoardId = function (boardId, cb) {
  return this.find({ buid: boardId }, cb);
};

reply.statics.getBody = function (replyId, cb) {
  return this.findOne({ _id: replyId }, { _id: 0, body: 1 }, cb);
};

// Auth
reply.statics.isWriter = function (uid, replyId) {
  return this.findOne({ _id: replyId, uid: uid });
};

// Update
reply.statics.update = async function ({replyId, newReplyBody}, cb) {
  this.updateOne(
    { _id: replyId },
    {
      body: newReplyBody,
      edited: true,
    },
    cb
  );
};

// Delete
reply.statics.delete = function (replyId, cb) {
  return this.deleteOne({ _id: replyId }, cb);
};

reply.statics.deleteByBoardId = function (boardId, cb) {
  return this.deleteMany({ boardId }, cb)
}

module.exports = mongoose.model("Reply", reply);
