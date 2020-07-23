const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const react = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  boardId: { type: ObjectId, required: true },
  userScreenId: { type: String, required: true },
  userNick: { type: String, required: true },
  type: { type: String, required: true },
  reactTime: { type: Date, default: Date.now },
});

react.statics.create = function (data, cb) {
  const reactData = new this(data);
  return reactData.save(cb);
};

react.statics.removeReact = function (reactId, cb) {
  return this.deleteOne({ _id: reactId }, cb);
};

// 글에 대한 반응 뷰
react.statics.getReactListByBoardId = function (boardId, cb) {
  return this.find({ boardId }, cb);
};

module.exports = mongoose.model("React", react);
