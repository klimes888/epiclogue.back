const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const ReplyOnReply = new mongoose.Schema({
  parentId: { type: ObjectId, required: true },
  uid: { type: ObjectId, required: true },
  body: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  // heartCount: { type: Number, default: 0 },
});

ReplyOnReply.statics.create = function (data) {
  const rorData = new this(data);
  return rorData.save();
};

ReplyOnReply.statics.updateReplyOnReply = function ({replyOnReplyId, replyOnReplyBody}) {
  return this.updateOne(
    { _id: replyOnReplyId },
    {
      body: replyOnReplyBody,
      edited: true,
    }
  );
};

ReplyOnReply.statics.removeReplyOnReply = function (replyOnReplyId) {
  return this.deleteOne({ _id: replyOnReplyId });
};

ReplyOnReply.statics.getRepliesByParentId = function (parentReplyId) {
  return this.find({ parentId: parentReplyId });
};

module.exports = mongoose.model("ReplyOnReply", ReplyOnReply);