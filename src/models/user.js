import mongoose from "mongoose";

mongoose.set("useCreateIndex", true);

const user = new mongoose.Schema({
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  screenId: { type: String },
  country: { type: String },
  joinDate: { type: Date, required: true, default: Date.now },
  language: { type: [String] },
  intro: { type: String },
  banner: { type: String },
  profile: { type: String },
  salt: { type: String },
  isConfirmed: { type: Boolean, required: true, default: false },
  token: { type: String },
  followerCount: { type: Number },
  followingCount: { type: Number },
});

user.statics.create = function (data) {
  const userinfo = new this(data);

  return userinfo.save();
};

user.statics.isScreenIdUnique = async function (screenId) {
  const result = await this.findOne({ screenId });

  if (result === null) {
    return true;
  } else {
    return false;
  }
};

user.statics.isConfirmed = function (email, token) {
  return this.findOne({ email, token });
};

user.statics.confirmUser = function (email) {
  return this.updateOne({ email }, { isConfirmed: true, token: "" });
};

user.statics.getById = function (userId) {
  return this.findOne({ _id: userId })
}

user.statics.isExist = function (email) {
  return this.findOne({ email });
};

/* 
    @2020-08-07
    find 함수가 4개 (findUser, getUserInfo, findAll, getProfile)인데,
    리팩토링 때 option을 parameter로 주고 필요한 데이터만 뽑아내는 작업이 필요해보임.
*/
user.statics.findUser = function (email, userpw) {
  // 특수기호 $는 쓰지못하게 해야 기초적인 인젝션 방어가 가능함
  return this.findOne({ email: email, password: userpw });
};

user.statics.getSalt = function (email) {
  return this.findOne({ email }, { _id: 0, salt: 1 });
};

user.statics.getUserInfo = function (uid, option) {
  return this.findOne({ _id: uid }, option);
};

user.statics.getUserInfoByScreenId = function (screenId, option) {
  return this.findOne({ screenId: screenId }, option);
};

user.statics.deleteUser = function (uid, userpw) {
  return this.deleteOne({ _id: uid, password: userpw });
};

user.statics.findAll = function () {
  return this.find({});
};

user.statics.changePass = function (uid, userPw, userPwNew, saltNew) {
  return this.updateOne(
    { _id: uid, password: userPw },
    { password: userPwNew, salt: saltNew }
  );
};

user.statics.changeInfo = function (uid, userpw) {
  return this.updateOne({ _id: uid }, { password: userpw });
};

user.statics.checkPass = function (uid, userpw) {
  return this.findOne({ _id: uid, password: userpw });
};

user.statics.updateProfile = function (profile) {
  return this.updateOne(
    { _id: profile.uid },
    {
      nickname: profile.nick,
      screenId: profile.screenId,
      country: profile.country,
      language: profile.lang,
      intro: profile.intro,
      banner: profile.bann,
      profile: profile.prof,
    }
  );
};

user.statics.getProfile = function (screenId) {
  return this.find({ _id: screenId }, { _id: 1, screenId: 1, nickname: 1 });
};

user.statics.getByQuery = function (query) {
  return this.find({ screenId: { $regex: query } },
    { screenId: 1, nickname: 1, profile: 1 }).sort({ screenId: 'asc' })
}

user.statics.countFollower = function (userId, flag) {
  const increment = flag ? 1 : -1
  return this.updateOne({ _id: userId }, { followerCount: increment })
}

user.statics.countFollowing = function (userId, flag) {
  const increment = flag ? 1 : -1
  return this.updateOne({ _id: userId }, { followingCount: increment })
}

export default mongoose.model('User', user);
