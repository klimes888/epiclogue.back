const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
mongoose.set("useCreateIndex", true);

const reply = new mongoose.Schema({
  uid: { type: ObjectId, required: true },
  buid: { type: ObjectId, default: null },
  replyBody: { type: String, required: true },
  writeDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  parentId: { type: ObjectId, default: null},
  hasChild: { type: Boolean, default: false }
});

// Create
reply.statics.create = function (data) {
  const replyData = new this(data);
  return replyData.save();
};

reply.statics.createReplyOnReply = function (data) {
  const replyOnReplyData = new this({
    uid: data.uid,
    replyBody: data.replyBody,
    parentId: data.replyId
  }, (err, data) => {
    if (err) {
      console.log("[LOG] 데이터베이스 질의 에러")
      return;
    }
  })
  
  this.updateOne({ _id: data.replyId }, { hasChild: true });
  return replyOnReplyData.save();
}
// Read
reply.statics.getRepliesByBoardId = function (boardId) {
  return this.find({ buid: boardId });
}

reply.statics.getRepliesByParentId = function (replyId) {
  return this.find({ parentId: replyId })
}

reply.statics.isWriter = function (uid, replyId) {
  this.findOne({ _id: replyId, uid: uid})
}

reply.statics.becomeParent = function (replyId) {
  console.log('띠용')
  this.updateOne({ _id: replyId}, { hasChild: true }, (err, data) => {
    if (err) {
      console.log("[LOG] 데이터베이스 질의 에러" + err)
    }
  });
}

// Update
reply.statics.updateReply = async function (replyId, newReplyBody) {
  this.updateOne(
    { _id: replyId },
    {
      replyBody: newReplyBody,
      edited: true,
    }, function (err, data) {
      if (err) {
        console.log("[LOG] 데이터베이스 에러")
        return false
      }
      console.log(data)
      if (data.ok === 1 && data.nModified === data.n) { 
        // n: 선택된 document 수
        // nModified: 변경된 document 수
        return true
      } else if (data.ok === 1 && data.nModified !== data.n) {
        // 내용이 변경되지 않음
        return true
      } 
      else {
        console.log("[LOG] 댓글 업데이트 실패")
        return false
      }
    }
  );
};

// Delete
reply.statics.removeReply = function (replyId) {
  return this.deleteOne({ _id: replyId }, (err, data) =>{
    if (err) {
      console.log(`[LOG] 데이터베이스 질의 에러`)
      return false
    }
    if (data.ok === 1 && data.deletedCount === 1) {
      return true
    } else if (data.ok === 1 && data.deletedCount === 0) {
      console.log(`[LOG] 댓글 삭제 실패: ${replyId} 가 존재하지 않음`)
      return true
    }
  });
};

module.exports = mongoose.model("Reply", reply);
