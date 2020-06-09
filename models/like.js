const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const like = new mongoose.Schema({
    uid: {type: String, required: true},
    targetUid: {type: String, required: true},
    targetType: {type: String, required: true}
})


module.exports = mongoose.model('Like', like);