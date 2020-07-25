const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId;
mongoose.set('useCreateIndex', true);

const board = new mongoose.Schema({
    uid: {type: ObjectId, required: true},
    boardTitle: {type: String, default:"" },
    boardImg: {type: [String], required: true},
    boardBody:{type:String, default: "" },
    category: {type:String, required: true},
    pub: {type:String, required: true},
    writeDate: {type:Date, default: Date.now},
    language: { type: String, default: "Korean" },
    heartCount: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
    originUid:{type:ObjectId},
    originBuId:{type:ObjectId},
    edited: { type: Boolean, default: false }
})

board.statics.create = function (data) {
    const boardData = new this(data);

    return boardData.save();
}

/* 수정, 삭제, 댓글에 필요한 boardId GET (미검증) */
board.statics.getArticle = function ( boardId, cb ) {
    return this.findOne({ "_id" : boardId }, cb);
}

/* 특정 유저의 글 GET (미검증) */ 
board.statics.getUserArticleList = function (userId) {
  this.find({ uid: userId }, (err, data) => {
    return data;
  });
};

board.statics.isWriter = function (userId, boardId, cb) {
  return this.findOne({ _id: boardId, uid: userId }, cb)
}

board.statics.updateArticle = function (articleData, cb) {
  this.updateOne(
    { _id: articleData.boardId },
    {
      boardTitle: articleData.boardTitle,
      boardBody: articleData.boardBody,
      boardImg: articleData.boardImg,
      category: articleData.category,
      pub: articleData.pub,
      language: articleData.language,
      edited: true,
    }, cb
  );
};

board.statics.removeArticle = function (buid, cb) {
    return this.deleteOne({ _id: buid }, cb)
}


/* 글 전체 조회 */
board.statics.findAll = function () {
  // uid를 이용해 유저 닉네임을 응답데이터에 넣어야하는데 어떻게 넣어야 효율적일지 고민이 필요
  return this.find(
    {},
    { _id: 1, boardTitle: 1, uid: 1, pub: 1, category: 1, boardImg: 1 }
  );
};

module.exports = mongoose.model('Board', board);