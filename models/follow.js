const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const follw = new mongoose.Schema({
    uid: {type: String, required: true},
    targetUid: {type: String, required: true},
})



module.exports = mongoose.model('follow', follow);