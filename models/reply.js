const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const reply = new mongoose.Schema({
  uid: { type: ObjectId, required: true },
  buid: { type: ObjectId, required: true },
  body: { type: String, required: true },
  writeDate: { type: Date, required: true, default: Date.now },
  edited: { type: Boolean, default: false },
  // heartCount: { type: Number, default: 0 },
  // replyOnReply: [
  //   {
  //     uid: { type: ObjectId },
  //     body: { type: String },
  //     writeDate: { type: Date, default: Date.now },
  //     heartCount: { type: Number, default: 0 },
  //     edited: { type: Boolean, default: false },
  //   },
  // ],
});

reply.statics.create = function (data) {
  const replyData = new this(data);
  return replyData.save();
};

// 하나만 조회하는 일은 없을 것이라 생각하여 주석처리
// reply.statics.getReplyById = function (replyId) {
//   return this.find({ _id: replyId });
// };

reply.statics.updateReply = function ({ replyId, newReplyBody }) {
  return this.updateOne(
    { _id: replyId },
    {
      $set: {
        replyBody: newReplyBody,
        edited: true
      },
    }
  );
};

reply.statics.removeReply = function (replyId) {
  return this.deleteOne({ _id: replyId });
};

reply.statics.getRepliesByBoardId = function (boardId) {
  return this.find({ buid: boardId });
}

// reply.statics.createReplyOnReply = function ({ replyId, replyOnReplyBody, uid }) {
//     return this.updateOne({ _id: replyId }, {
//         $push: {
//             replyOnReply: {
//                 uid: uid,
//                 body: replyOnReplyBody
//             }
//         }
//     })
// }

// reply.statics.updateReplyOnReply = function ({ replyId, newReplyOnReplyBody }) {
//     return this.updateOne({ _id: replyId }, {
//         $set: {

//         }
//     })
// }

module.exports = mongoose.model("Reply", reply);
