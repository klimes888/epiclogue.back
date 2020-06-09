const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const reply = new mongoose.Schema({
    uid:{type:String, required:true},
    replyBody:{type:String, required:true},
    likeCount:{type:Number, required:true}
})

module.exports = mongoose.model('Reply', reply);