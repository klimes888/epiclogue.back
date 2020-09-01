import mongoose from "mongoose";
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const react = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  boardId: { type: ObjectId, required: true },
  type: { type: String, required: true }, // like, bookmark, translate
  createdAt: { type: Date, default: Date.now },
});

react.statics.create = function (data) {
  const reactData = new this(data);
  return reactData.save();
};

react.statics.delete = function (userId, boardId) {
  return this.deleteOne({ userId, boardId });
};

react.statics.getByBoardId = function (boardId) {
  return this.find({ boardId }, {
    _id: 0, __v: 0
  });
};

module.exports = mongoose.model("React", react);
