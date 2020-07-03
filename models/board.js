const mongoose = require('mongoose');
const User = require('./users');
const reply = require('./reply').Schema;
mongoose.set('useCreateIndex', true);

const board = new mongoose.Schema({
    uid: {type: String, required: true},
    boardTitle: {type: String},
    boardImg: {type: [String], required: true},
    boardBody:{type:String},
    catagory: {type:String, required: true},
    pub: {type:String, required: true},
    writeDate: {type:Date, required: true, default: Date.now},
    originUid:{type:String, required: true},
    originBuId:{type:String, required: true},
    likeCount:{type:Number},
    replyList:{type: [reply]},
    // reactList:{type: [react]}
})

board.static.create = function (data) {
    const boardData = new this(data);

    return boardData.save();
}

/* 수정, 삭제, 댓글에 필요한 boardId GET (미검증) */
board.static.getArticle = ( boardId ) => {
    return this.findOne({ "_id" : boardId });
}

/* 특정 유저의 글 GET (미검증) */ 
board.static.getUserArticleList = ( userId ) => {
    return this.find({ uid: userId });
}

/* 글 수정 (미검증. 수정 후 뷰를 수정된 글을 보여줄 것인지 논의 필요(returnNewDocument T/F를 위함 )) */
board.static.updateArticle = (articleData) => {
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

/* 글 전체 조회 (미검증) */
board.static.findAll = function () {
    return this.find();
}



module.exports = mongoose.model('Board', board);