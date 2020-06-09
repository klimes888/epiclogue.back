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
    writeDate: {type:Date, required: true},
    originUid:{type:String, required: true},
    originBuId:{type:String, required: true},
    likeCount:{type:Number},
    replyList:{type:[reply]}
})



module.exports = mongoose.model('Board', board);