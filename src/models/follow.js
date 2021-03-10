import mongoose from 'mongoose';

const { ObjectId } = mongoose;

const follow = new mongoose.Schema({
  userId: { type: ObjectId, required: true, ref: 'User' },
  targetUserId: { type: ObjectId, required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Follow', follow);
