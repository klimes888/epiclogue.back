const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const react = new mongoose.Schema({
  uid: { type: ObjectId, required: true },
  buid: { type: ObjectId, required: true },
  userId: { type: String, required: true },
  userNick: { type: String, required: true },
  type: { type: String, required: true },
  reactTime: { type: Date, default: Date.now },
});

react.statics.create = function (data) {
  const reactData = new this(data);
  return reactData.save();
};

react.statics.removeReact = function (reactId) {
  return this.deleteOne({ _id: reactId });
};

// 글에 대한 반응 뷰를 위함
react.statics.getReactListByBoardId = function (boardId) {
  return this.find({ buid: boardId });
};

module.exports = mongoose.model("React", react);
