import { User } from '../models'

export const create = function (data) {
  const userinfo = new User(data)

  return userinfo.save()
}

export const isScreenIdUnique = async function (uid, screenId) {
  const result = await User.findOne({ screenId, _id: { $ne: uid } })

  return result === null
}

export const getByScreenId = function (screenId, projectionOption) {
  return User.findOne({ screenId }, projectionOption)
}

export const isConfirmed = function (email, token) {
  return User.findOne({ email, token, snsType: 'normal' })
}

export const confirmUser = function (email) {
  return User.updateOne({ email, snsType: 'normal' }, { isConfirmed: true })
}

export const getById = function (userId) {
  return User.findOne({ _id: userId })
}

export const isExist = function (email) {
  return User.findOne({ email, snsType: 'normal' })
}

export const findByScreenId = function (screenId) {
  return User.findOne({ screenId })
}

/*
      @2020-08-07
      find 함수가 4개 (findUser, getUserInfo, findAll, getProfile)인데,
      리팩토링 때 option을 parameter로 주고 필요한 데이터만 뽑아내는 작업이 필요해보임.
  */
export const findUser = function (email, userpw) {
  // 특수기호 $는 쓰지못하게 해야 기초적인 인젝션 방어가 가능함
  return User.findOne({ email, password: userpw })
}

export const getSalt = function (email) {
  return User.findOne({ email, snsType: 'normal' }, { _id: 0, salt: 1 })
}

export const getUserInfo = function (userId, option) {
  return User.findOne({ _id: userId }, option)
}

export const getIdByScreenId = function (screenId) {
  return User.findOne({ screenId }, { _id: 1 })
}

export const getUserInfoByScreenId = function (screenId, option) {
  return User.findOne({ screenId }, option)
}

export const deleteUser = function (userId, userpw) {
  return User.updateOne({ _id: userId, password: userpw }, { deactivatedAt: Date.now() })
}

export const changePass = function (userId, userPw, userPwNew, saltNew) {
  return User.updateOne({ _id: userId, password: userPw }, { password: userPwNew, salt: saltNew })
}

export const changeInfo = function (userId, userpw) {
  return User.updateOne({ _id: userId }, { password: userpw })
}

export const checkPass = function (userId, userpw) {
  return User.findOne({ _id: userId, password: userpw })
}

export const updateProfile = function (profile, session) {
  return User.updateOne(
    { _id: profile.userId },
    {
      nickname: profile.nickname,
      screenId: profile.screenId,
      displayLanguage: profile.displayLanguage,
      availableLanguage: profile.availableLanguage,
      intro: profile.intro,
      banner: profile.banner,
      profile: profile.profile,
    },
    { session }
  )
}

export const getProfile = function (screenId) {
  return User.find({ _id: screenId }, { _id: 1, screenId: 1, nickname: 1 })
}

export const searchByScreenIdOrNickname = function (query, size = 35, latestId) {
  const option = {
    $or: [{ screenId: { $regex: query } }, { nickname: { $regex: query } }],
  }
  if(latestId) {
    option._id = { $gt: latestId }
  }
  return User.find(option, {
    nickname: 1,
    screenId: 1,
    profile: 1,
    banner: 1,
    intro: 1,
  })
    .sort({ screenId: 1, nickname: 1 })
    .limit(size)
}

export const isExistSns = function (snsId) {
  return User.findOne({ snsId })
}

export const isAdmin = async function (_id) {
  const tempData = await User.findOne({ _id })
  const userData = tempData.toJSON()
  return userData.isAdmin === true
}

export const setTokenForAuth = async (email, userToken) =>
  User.updateOne({ email }, { $set: { token: userToken } })

export const resetPass = async (email, salt, password) =>
  User.updateOne({ email, snsType: 'normal' }, { salt, password })
