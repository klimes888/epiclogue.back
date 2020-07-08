const mongoose = require("mongoose");
const { LexModelBuildingService } = require("aws-sdk");
const ObjectId = mongoose.ObjectId;

const ReplyOnReply = new mongoose.Schema({
  parentId: { type: ObjectId, required: true },
  userId: { type: ObjectId, required: true },
  body: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  heartCount: { type: Number, default: 0 },
});

ReplyOnReply.statics.create = function (data) {
  const rorData = new this(data);
  return rorData.save();
};

ReplyOnReply.statics.updateReplyOnReply = function ({ replyOnReplyId, replyOnReplyBody }) {
  return this.updateOne(
    { _id: replyOnReplyId },
    {
      $set: {
        body: replyOnReplyBody,
      },
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