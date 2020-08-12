const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const Feedback = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  boardId: { type: ObjectId, required: true },
  feedbackBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  childCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
});

// Create
Feedback.statics.create = function (data, cb) {
  const feedbackData = new this(data);
  return feedbackData.save(cb);
};

// Read
Feedback.statics.getByBoardId = function (boardId, cb) {
  return this.find({ boardId }, cb);
};

Feedback.statics.getBody = function (feedbackId, cb) {
  return this.findOne({ _id: feedbackId }, { _id: 0, feedbackBody: 1 }, cb);
};

// Auth
Feedback.statics.isWriter = function (userId, feedbackId, cb) {
  return this.findOne({ _id: feedbackId, userId }, cb);
};

// Update
Feedback.statics.update = async function (newFeedbackData, cb) {
  return this.updateOne(
    { _id: newFeedbackData.feedbackId },
    {
      feedbackBody: newFeedbackData.newFeedbackBody,
      edited: true,
    }
  );
};

// Delete
Feedback.statics.delete = function (feedbackId, cb) {
  return this.deleteOne({ _id: feedbackId }, cb);
};

Feedback.statics.deleteByBoardId = function (boardId, cb) {
  return this.deleteMany({ boardId }, cb)
}

Feedback.statics.getById = function (feedbackId, cb) {
  return this.findOne({ _id: feedbackId }, cb)
}

// Counting 추가 필요

module.exports = mongoose.model("Feedback", Feedback);
