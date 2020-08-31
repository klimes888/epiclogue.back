import mongoose from "mongoose";
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const Feedback = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  boardId: { type: ObjectId, required: true },
  feedbackBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
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
  });
};

Feedback.statics.getBody = function (feedbackId) {
  return this.findOne({ _id: feedbackId }, { _id: 0, feedbackBody: 1 });
};

// Auth
Feedback.statics.isWriter = function (userId, feedbackId) {
  return this.findOne({ _id: feedbackId, userId });
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

module.exports = mongoose.model("Feedback", Feedback);
