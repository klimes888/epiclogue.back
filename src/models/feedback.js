import mongoose from 'mongoose'

const { ObjectId } = mongoose

const Feedback = new mongoose.Schema({
  writer: { type: ObjectId, required: true, ref: 'User' },
  boardId: { type: ObjectId, required: true },
  feedbackBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
})

export default mongoose.model('Feedback', Feedback)
