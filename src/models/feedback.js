import mongoose from "mongoose";
const ObjectId = mongoose.ObjectId;

const Feedback = new mongoose.Schema({
  writer: { type: ObjectId, required: true, ref: 'User' },
  boardId: { type: ObjectId, required: true },
  feedbackBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  replies: [{ type: ObjectId, ref: 'Reply'}],
  childCount: { type: Number, default: 0 },
  heartCount: { type: Number, default: 0 },
});

// Create
Feedback.statics.create = function (data) {
  const feedbackData = new this(data);
  return feedbackData.save();
};

// Read
Feedback.statics.getByBoardId = function (boardId) {
  return this.find({ boardId }, {
    __v: 0
  }).populate({ path: 'writer', select: 'screenId nickname'});
};

Feedback.statics.getBody = function (feedbackId) {
  return this.findOne({ _id: feedbackId }, { _id: 0, feedbackBody: 1 });
};

// Auth
Feedback.statics.isWriter = function (userId, feedbackId) {
  return this.findOne({ _id: feedbackId, writer: userId });
};

// Update
Feedback.statics.update = async function (newFeedbackData) {
  return this.updateOne(
    { _id: newFeedbackData.feedbackId },
    {
      feedbackBody: newFeedbackData.newFeedbackBody,
      edited: true,
    }
  );
};

// Delete
Feedback.statics.delete = function (feedbackId) {
  return this.deleteOne({ _id: feedbackId });
};

Feedback.statics.deleteByBoardId = function (boardId) {
  return this.deleteMany({ boardId })
}

Feedback.statics.getById = function (feedbackId) {
  return this.findOne({ _id: feedbackId })
}

Feedback.statics.getReply = function (feedbackId, replyId) {
  return this.updateOne({ _id: feedbackId }, { $push: { replies: replyId } })
}

Feedback.statics.countReply = function (feedbackId, flag) {
  const increment = flag ? 1 : -1
  return this.findOneAndUpdate({ _id: feedbackId }, { $inc: { childCount: increment } })
}

Feedback.statics.countHeart = function (feedbackId, flag) {
  const increment = flag ? 1 : -1
  return this.findOneAndUpdate({ _id: feedbackId }, { $inc: { heartCount: increment } })
}

Feedback.statics.getHeartCount = function (feedbackId) {
  return this.findOne({ _id: feedbackId }, { heartCount: 1, _id: 0 })
}

export default mongoose.model("Feedback", Feedback);
