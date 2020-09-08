import mongoose from "mongoose";
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
Reply.statics.create = function (data) {
  const ReplyData = new this(data);
  return ReplyData.save();
};

// Auth
Reply.statics.isWriter = function (userId, replyId) {
  return this.findOne({ _id: replyId, userId: userId });
};

// Read
Reply.statics.getByParentId = function (parentId) {
  return this.find({ parentId });
};

Reply.statics.getBody = function (replyId) {
  return this.findOne({ _id: replyId }, { _id: 0, replyBody: 1 });
};

// Update
Reply.statics.update = async function (updateForm) {
  return this.updateOne(
    { _id: updateForm.replyId },
    {
      replyBody: updateForm.newReplyBody,
      edited: true,
    }
  );
};

// Delete
Reply.statics.delete = function (replyId) {
  return this.deleteOne({ _id: replyId });
};

// Delete all
Reply.statics.deleteByBoardId = function (boardId) {
  return this.deleteMany({ boardId });
};

Reply.statics.deleteByParentId = function (parentId) {
  return this.deleteMany({ parentId });
};

Reply.statics.getById = function (replyId) {
  return this.findOne({ _id: replyId });
};

Reply.statics.getParentId = function (replyId) {
  return this.findOne({ _id: replyId }, { parentId: 1 });
};

Reply.statics.countHeart = function (replyId, flag) {
  const increment = flag ? 1 : -1
  return this.findOneAndUpdate({ _id: replyId }, { $inc: { heartCount: increment } })
}

Reply.statics.getHeartCount = function (replyId) {
  return this.findOne({ _id: replyId }, { heartCount: 1, _id: 0 })
}

export const Reply = mongoose.model("Reply", Reply);
