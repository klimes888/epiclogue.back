import mongoose from 'mongoose';

const { ObjectId } = mongoose;

const react = new mongoose.Schema({
  user: { type: ObjectId, required: true, ref: 'User' },
  boardId: { type: ObjectId, required: true },
  type: { type: String, required: true, enum: ['like', 'bookmark', 'translate'] }, // like, bookmark, translate
  createdAt: { type: Date, default: Date.now },
});

react.statics.create = function (data) {
  const reactData = new this(data);
  return reactData.save();
};

react.statics.delete = function (user, boardId) {
  return this.deleteOne({ user, boardId });
};

react.statics.getByBoardId = function (boardId) {
  return this.find(
    { boardId },
    {
      _id: 0,
      __v: 0,
      boardId: 0,
    }
  ).populate({ path: 'user', select: '_id screenId nickname profile' });
};

react.statics.countReacts = function (boardId) {
  return this.countDocuments({ boardId });
};

export default mongoose.model('React', react);
