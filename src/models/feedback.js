import mongoose from 'mongoose'

const { ObjectId } = mongoose

const Feedback = new mongoose.Schema({
  writer: { type: ObjectId, required: true, ref: 'User' },
  boardId: { type: ObjectId, required: true },
  feedbackBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  isBlind: { type: Boolean, default: false } // 신고 10건이상 누적시 자동 true
})

export default mongoose.model('Feedback', Feedback)
