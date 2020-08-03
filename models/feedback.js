const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const Feedback = new mongoose.Schema({
  uid: { type: ObjectId, required: true },
  buid: { type: ObjectId, required: true },
  replyBody: { type: String, required: true },
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
  return this.find({ buid: boardId }, cb);
};

Feedback.statics.getBody = function (feedbackId, cb) {
  return this.findOne({ _id: feedbackId }, { _id: 0, replyBody: 1 }, cb);
};

// Auth
Feedback.statics.isWriter = function (uid, feedbackId, cb) {
  return this.findOne({ _id: feedbackId, uid: uid }, cb);
};

// Update
Feedback.statics.update = async function (newFeedbackData, cb) {
  this.updateOne(
    { _id: newFeedbackData.feedbackId },
    {
      replyBody: newFeedbackData.newBody,
      edited: true,
    },
    cb
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
