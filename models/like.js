const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const like = new mongoose.Schema({
    email: {type: String, required: true},
    boardId: {type: String, required: true},
})


module.exports = mongoose.model('Like', like);