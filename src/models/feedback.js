import mongoose from 'mongoose';

const { ObjectId } = mongoose;

const Feedback = new mongoose.Schema({
  writer: { type: ObjectId, required: true, ref: 'User' },
  boardId: { type: ObjectId, required: true },
  feedbackBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
});

// Create
Feedback.statics.create = function (data) {
  const feedbackData = new this(data);
  return feedbackData.save();
};

// Read
Feedback.statics.getByBoardId = function (boardId) {
  return this.find(
    { boardId },
    {
      __v: 0,
    }
  ).populate({ path: 'writer', select: '_id screenId nickname profile' });
};

Feedback.statics.getBody = function (feedbackId) {
  return this.findOne({ _id: feedbackId }, { _id: 0, feedbackBody: 1 });
};

// Auth
Feedback.statics.isWriter = function (userId, feedbackId) {
  return this.findOne({ _id: feedbackId, writer: userId });
};

// Update
Feedback.statics.update = async function (newFeedbackData, session) {
  return this.updateOne(
    { _id: newFeedbackData.feedbackId },
    {
      feedbackBody: newFeedbackData.newFeedbackBody,
      edited: true,
    },
    { session }
  );
};

// Delete
Feedback.statics.delete = function (feedbackId) {
  return this.deleteOne({ _id: feedbackId });
};

Feedback.statics.deleteByBoardId = function (boardId) {
  return this.deleteMany({ boardId });
};

Feedback.statics.getById = function (feedbackId, option) {
  return this.findOne({ _id: feedbackId }, option);
};

export default mongoose.model('Feedback', Feedback);
