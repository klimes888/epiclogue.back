const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const book = new mongoose.Schema({
    email: {type: String, required: true},
    boardId: {type: String, required: true},
})



module.exports = mongoose.model('Book', book);