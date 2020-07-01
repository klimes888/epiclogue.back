const mongoose = require('mongoose');
const reply = require('./reply');
mongoose.set('useCreateIndex', true);

const board = new mongoose.Schema({
    uid: {type: String, required: true},
    boardTitle: {type: String},
    boardImg: {type: String, required: true},
    boardBody:{type:String},
    catagory: {type:String, required: true},
    pub: {type:String, required: true},
    writeDate: {type:Date, required: true, default: Date.now},
    originUid:{type:String, required: true},
    originBuId:{type:String, required: true},
    likeCount:{type:Number},
    replyList:{type:[reply]}
})

board.static.create = function (data) {
    const boardData = new this(data);

    return boardData.save();
}

// 수정, 삭제, 댓글에 필요한 boardId
board.static.getArticle = function (boardId) {

}

board.static.findAll = function () {
    return this.find({});
}



module.exports = mongoose.model('Board', board);