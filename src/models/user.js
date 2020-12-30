import mongoose from 'mongoose'

const user = new mongoose.Schema({
  nickname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  screenId: { type: String },
  country: { type: Number, default: 0 }, // 0: Korean, 1: Japanese, 2: English, 3: Chinese, 4: Taiwan
  displayLanguage: { type: Number, default: 0 }, // 0: Korean, 1: Japanese, 2: English, 3: Chinese(Simplified), 4: Chinese(Traditional)
  availableLanguage: { type: [String] },
  joinDate: { type: Date, required: true, default: Date.now },
  deactivatedAt: { type: Date, default: null },
  termsOfUseAcceptedAt: { type: Date, required: true, default: Date.now },
  intro: { type: String, default: null },
  banner: { type: String, default: null },
  profile: { type: String, default: null },
  salt: { type: String },
  isConfirmed: { type: Boolean, required: true, default: false },
  token: { type: String },
  snsId: {type: String},
  snsType: { type: String, default: 'normal' },
})

user.statics.create = function (data) {
  const userinfo = new this(data)

  return userinfo.save()
}

user.statics.isScreenIdUnique = async function (screenId, session) {
  const result = await this.findOne({ screenId }, {}, { session })

  if (result === null) {
    return true
  } else {
    return false
  }
}

user.statics.getByScreenId = function (screenId) {
  return this.findOne({ screenId })
}

user.statics.isConfirmed = function (email, token) {
  return this.findOne({ email, token })
}

user.statics.confirmUser = function (email) {
  return this.updateOne({ email }, { isConfirmed: true })
}

user.statics.getById = function (userId) {
  return this.findOne({ _id: userId })
}

user.statics.isExist = function (email) {
  return this.findOne({ email })
}

user.statics.findByScreenId = function (screenId) {
  return this.findOne({ screenId })
}

/* 
    @2020-08-07
    find 함수가 4개 (findUser, getUserInfo, findAll, getProfile)인데,
    리팩토링 때 option을 parameter로 주고 필요한 데이터만 뽑아내는 작업이 필요해보임.
*/
user.statics.findUser = function (email, userpw) {
  // 특수기호 $는 쓰지못하게 해야 기초적인 인젝션 방어가 가능함
  return this.findOne({ email: email, password: userpw })
}

user.statics.getSalt = function (email) {
  return this.findOne({ email }, { _id: 0, salt: 1 })
}

user.statics.getUserInfo = function (userId, option) {
  return this.findOne({ _id: userId }, option)
}

user.statics.getIdByScreenId = function (screenId) {
  return this.findOne({ screenId }, { _id: 1 })
}

user.statics.getUserInfoByScreenId = function (screenId, option) {
  return this.findOne({ screenId: screenId }, option)
}

user.statics.deleteUser = function (userId, userpw) {
  return this.updateOne({ _id: userId, password: userpw }, { deactivatedAt: Date.now() })
}

user.statics.findAll = function () {
  return this.find({})
}

user.statics.changePass = function (userId, userPw, userPwNew, saltNew, session) {
  return this.updateOne({ _id: userId, password: userPw }, { password: userPwNew, salt: saltNew }, { session })
}

user.statics.changeInfo = function (userId, userpw) {
  return this.updateOne({ _id: userId }, { password: userpw })
}

user.statics.checkPass = function (userId, userpw) {
  return this.findOne({ _id: userId, password: userpw })
}

user.statics.updateProfile = function (profile, session) {
  return this.updateOne(
    { _id: profile.userId },
    {
      nickname: profile.nickname,
      screenId: profile.screenId,
      country: profile.country,
      availableLanguage: profile.availableLanguage,
      intro: profile.intro,
      banner: profile.banner,
      profile: profile.profile,
    },
    { session }
  )
}

user.statics.getProfile = function (screenId) {
  return this.find({ _id: screenId }, { _id: 1, screenId: 1, nickname: 1 })
}

user.statics.getByQuery = function (query) {
  return this.find({ screenId: { $regex: query } }, { screenId: 1, nickname: 1, profile: 1 }).sort({
    screenId: 'asc',
  })
}

user.statics.isExistSns = function (snsId) {
  return this.find({snsId})
}

export default mongoose.model('User', user)
