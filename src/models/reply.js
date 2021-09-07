import mongoose from 'mongoose'

const { ObjectId } = mongoose

const Reply = new mongoose.Schema({
  writer: { type: ObjectId, required: true, ref: 'User' },
  boardId: { type: ObjectId, required: true },
  parentId: { type: ObjectId, required: true },
  replyBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  isBlind: { type: Boolean, default: false } // 신고 10건이상 누적시 자동 true
})

export default mongoose.model('Reply', Reply)
