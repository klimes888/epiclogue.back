import mongoose from 'mongoose';

const { ObjectId } = mongoose;

const react = new mongoose.Schema({
  user: { type: ObjectId, required: true, ref: 'User' },
  boardId: { type: ObjectId, required: true },
  type: { type: String, required: true, enum: ['like', 'bookmark', 'translate'] }, // like, bookmark, translate
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('React', react);
