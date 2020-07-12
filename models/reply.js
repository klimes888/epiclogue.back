const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const reply = new mongoose.Schema({
  uid: { type: ObjectId, required: true },
  buid: { type: ObjectId, required: true },
  replyBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  // heartCount: { type: Number, default: 0 },
  // replyOnReply: [
  //   {
  //     uid: { type: ObjectId },
  //     body: { type: String },
  //     writeDate: { type: Date, default: Date.now },
  //     heartCount: { type: Number, default: 0 },
  //     edited: { type: Boolean, default: false },
  //   },
  // ],
});

reply.statics.create = function (data) {
  const replyData = new this(data);
  return replyData.save();
};

reply.statics.getRepliesByBoardId = function (boardId) {
  return this.find({ buid: boardId });
}

reply.statics.isWriter = function (uid, replyId) {
  const result = this.findOne({ _id: replyId, uid: uid})
  if (result !== null) {
    return true
  } else {
    return false
  }
}

reply.statics.updateReply = function (replyId, newReplyBody) {
  return this.updateOne(
    { _id: replyId },
    {
      replyBody: newReplyBody,
      edited: true,
    }
  );
};

reply.statics.removeReply = function (replyId) {
  return this.deleteOne({ _id: replyId });
};

module.exports = mongoose.model("Reply", reply);
