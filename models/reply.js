const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const reply = new mongoose.Schema({
    uid: { type: String, required: true },
    boardId: { type: String, required: true },
    replyBody: { type: String, required: true },
    replyWriteDate: { type: Date, required: true, default: Date.now },
    heartCount: { type: Number, default: 0 }
})

module.exports = mongoose.model('Reply', reply);    