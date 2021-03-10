import mongoose from 'mongoose';

const { ObjectId } = mongoose;

const Bookmark = new mongoose.Schema({
  user: { type: ObjectId, required: true, ref: 'User' },
  board: { type: ObjectId, required: true, ref: 'Board' },
  craeteAt: { type: Date, default: Date.now },
});

export default mongoose.model('Bookmark', Bookmark);
