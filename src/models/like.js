import mongoose from 'mongoose';

const { ObjectId } = mongoose;

const like = new mongoose.Schema({
  userId: { type: ObjectId, required: true, ref: 'User' },
  targetType: { type: String, required: true, enum: ['Board', 'Feedback', 'Reply'] },
  targetInfo: { type: ObjectId, required: true, refPath: 'targetType' },
  createdAt: { type: Date, default: Date.now },
});

like.statics.like = function (data) {
  const likeData = new this(data);
  return likeData.save();
};

like.statics.unlike = function (data) {
  return this.deleteOne(data);
};

like.statics.didLike = function (data) {
  return this.findOne(data);
};

like.statics.getByUserId = async function (userId, targetType) {
  return this.find(targetType === 'all' ? { userId } : { userId, targetType })
    .populate({ path: 'userId', select: '_id screenId nickname profile' })
    .populate({
      path: 'targetInfo',
      populate: { path: 'writer', select: '_id screenId nickname profile' },
    });
};

like.statics.countHearts = function (targetInfo, targetType) {
  return this.countDocuments({ targetInfo, targetType });
};

export default mongoose.model('Like', like);
