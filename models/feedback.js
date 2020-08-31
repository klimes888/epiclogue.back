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
  return this.deleteMany({ boardId }, {
    
  })
}

Feedback.statics.getById = function (feedbackId) {
  return this.findOne({ _id: feedbackId })
}

// Counting 추가 필요

module.exports = mongoose.model("Feedback", Feedback);
