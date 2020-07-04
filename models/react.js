const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const react = new mongoose.Schema({
    userId: { type: String, required: true },
    userNick: { type: String, required: true },
    type: { type: String, required: true },
    reactTime: { type: Date, required: true, default: Date.now}
})

module.exports = mongoose.model('React', react);    