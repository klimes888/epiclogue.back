import mongoose from 'mongoose';

const { ObjectId } = mongoose;

const Reply = new mongoose.Schema({
  writer: { type: ObjectId, required: true, ref: 'User' },
  boardId: { type: ObjectId, required: true },
  parentId: { type: ObjectId, required: true },
  replyBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
});

// Create
Reply.statics.create = function (data) {
  const ReplyData = new this(data);
  return ReplyData.save();
};

// Auth
Reply.statics.isWriter = function (userId, replyId) {
  return this.findOne({ _id: replyId, writer: userId });
};

// Read
Reply.statics.getByParentId = function (parentId) {
  return this.find({ parentId }, { __v: 0, boardId: 0, parentId: 0 }).populate({
    path: 'writer',
    select: 'nickname screenId profile',
  });
};

Reply.statics.getBody = function (replyId) {
  return this.findOne({ _id: replyId }, { _id: 0, replyBody: 1 });
};

// Update
Reply.statics.update = async function (updateForm, session) {
  return this.updateOne(
    { _id: updateForm.replyId },
    {
      replyBody: updateForm.newReplyBody,
      edited: true,
    },
    { session },
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

Reply.statics.getById = function (replyId, option) {
  return this.findOne({ _id: replyId }, option);
};

Reply.statics.getParentId = function (replyId) {
  return this.findOne({ _id: replyId }, { parentId: 1 });
};

export default mongoose.model('Reply', Reply);
