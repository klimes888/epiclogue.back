const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const ReplyOnReply = new mongoose.Schema({
  replyId: { type: ObjectId, required: true },
  uid: { type: ObjectId, required: true },
  replyOnReplyBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
});

ReplyOnReply.statics.create = function (data) {
  const rorData = new this(data);
  return rorData.save();
};

ReplyOnReply.statics.getRepliesByReplyId = function (replyId) {
  return this.find({ replyId: replyId });
};

ReplyOnReply.statics.isWriter = function (uid, replyOnReplyId) {
  const result = this.findOne({ _id: replyOnReplyId, uid: uid})
  if (result !== null) {
    return true
  } else {
    return false
  }
}

ReplyOnReply.statics.updateReplyOnReply = function (replyOnReplyId, newReplyOnReplyBody) {
  return this.updateOne(
    { _id: replyOnReplyId },
    {
      replyOnReplyBody: newReplyOnReplyBody,
      edited: true,
    }
  );
};

ReplyOnReply.statics.removeReplyOnReply = function (replyOnReplyId) {
  return this.deleteOne({ _id: replyOnReplyId });
};


module.exports = mongoose.model("ReplyOnReply", ReplyOnReply);