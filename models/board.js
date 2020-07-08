const mongoose = require('mongoose');
const User = require('./users');
const Reply = require('./reply').Schema;
const React = require('./react').Schema;
mongoose.set('useCreateIndex', true);

const board = new mongoose.Schema({
    uid: {type: String, required: true},
    // uid만 넣는게 아니라 Object 형식으로 필요한 유저정보를 모두 담고있어야 함
    boardTitle: {type: String},
    boardImg: {type: [String], required: true},
    boardBody:{type:String},
    category: {type:String, required: true},
    pub: {type:String, required: true},
    writeDate: {type:Date, required: true, default: Date.now},
    originUid:{type:String},
    originBuId:{type:String},
    // origin 정보들도 마찬가지로, uid값만 넣는게 아니라 필요한 모든 정보를 object 형태로 저장하고 있어야함.
    likeCount:{type:Number},
    replyList:{type: [Reply]},
    reactList:{type: [React]}
})

board.statics.create = function (data) {
    const boardData = new this(data);

    return boardData.save();
}

/* 수정, 삭제, 댓글에 필요한 boardId GET (미검증) */
board.statics.getArticle = function ( boardId ) {
    return this.findOne({ "_id" : boardId });
}

/* 특정 유저의 글 GET (미검증) */ 
board.statics.getUserArticleList = function ( userId ) {
    return this.find({ uid: userId });
}

/* 글 수정 (미검증. 수정 후 뷰를 수정된 글을 보여줄 것인지 논의 필요(returnNewDocument T/F를 위함 )) */
board.statics.updateArticle = function (articleData) {
    return this.updateOne({ "_id": articleData.uid }, {
        $set: {
            boardTitle: articleData.boardTitle,
            boardBody: articleData.boardBody,
            boardImg: articleData.boardImg,
            category: articleData.category,
            pub: articleData.pub,
            writeDate: articlaData.pub, // 수정됐을 경우 수정됐다는 표시가 필요할지 의논 필요
            language: articlaData.language
        }
    }, {
        returnNewDocument: false
    });
}

/* 글 전체 조회 */
board.statics.findAll = function () {
    // uid를 이용해 유저 닉네임을 응답데이터에 넣어야하는데 어떻게 넣어야 효율적일지 고민이 필요
    return this.find({}, {_id:1, boardTitle:1, uid:1, pub:1, category:1, boardImg:1});
}



module.exports = mongoose.model('Board', board);