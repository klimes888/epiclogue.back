const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const user = new mongoose.Schema({
    nickname: {type:String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    userid: {type:String},
    country: {type: String},
    language: {type:[String]},
    intro: {type:String},
    banner: {type:String},
    profile: {type:String},
    salt: {type:String},
    isConfirmed:{type:Boolean, required: true}
})

user.statics.create = function (data) {
    const userinfo = new this(data);
    
    return userinfo.save();
}

user.statics.findUser = function (email, userpw) {
    // 특수기호 $는 쓰지못하게 해야 기초적인 인젝션 방어가 가능함
    return this.findOne({"email": email, "password": userpw});
}

user.statics.getSalt = function (email) {
    return this.findOne({"email":email},{_id:0, salt:1});
}

user.statics.getUserInfo = function (uid) {
    return this.findOne({"_id":uid})
}

user.statics.deleteUser = function (uid, userpw) {
    return this.deleteOne({"_id":uid, "password":userpw});
}

user.statics.findAll = function () {
    return this.find({});
}

user.statics.changePass = function (uid, userPw, saltNew) {
    return this.updateOne({"_id":uid}, {"password":userPw, "salt":saltNew});
}

user.statics.changeInfo = function (uid, userpw) {
    return this.updateOne({"_id":uid}, {"password":userpw});
}

user.statics.checkPass = function (uid, userpw) {
    return this.findOne({"_id":uid, "password":userpw})
}

module.exports = mongoose.model('User', user);