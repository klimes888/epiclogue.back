const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const book = new mongoose.Schema({
    uid: {type: String, required: true},
    boardUid: {type: String, required: true},
})



module.exports = mongoose.model('Book', book);