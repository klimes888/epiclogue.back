import mongoose from 'mongoose';

const { ObjectId } = mongoose;

const like = new mongoose.Schema({
  userId: { type: ObjectId, required: true, ref: 'User' },
  targetType: { type: String, required: true, enum: ['Board', 'Feedback', 'Reply'] },
  targetInfo: { type: ObjectId, required: true, refPath: 'targetType' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Like', like);
