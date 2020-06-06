const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const board = new mongoose.Schema({
    email: {type: String, required: true},
    title: {type: String},
    imageUrl: {type: String, required: true},
    body:{type:String},
    catagory: {type:String, required: true},
    isPub: {type:String, required: true},
    writeDate: {type:Date, required: true},
    originEmail:{type:String, required: true},
    originId:{type:String, required: true}
})



module.exports = mongoose.model('Board', board);