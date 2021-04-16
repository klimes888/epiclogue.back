import Joi from 'joi'
import { deleteImage, thumbPathGen } from '../../lib/imageCtrl'
import { userDAO } from '../../DAO'
import { cryptoData, getRandomString } from '../../lib/cryptoData'
import { apiErrorGenerator } from '../../lib/apiErrorGenerator'
import { apiResponser } from '../../lib/middleware/apiResponser'

/**
 * @description 수정할 유저의 프로필 정보 반환
 * @access GET /user/editProfile
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 수정할 유저 프로필
 */
export const getUserEditInfo = async (req, res, next) => {
  const { uid } = res.locals
  try {
    const result = await userDAO.getUserInfo(uid, {
      nickname: 1,
      intro: 1,
      displayLanguage: 1,
      availableLanguage: 1,
      screenId: 1,
      banner: 1,
      profile: 1,
      email: 1,
    })

    return apiResponser({ req, res, data: result })
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}

/**
 * @description 유저 프로필 수정
 * @access POST /user/editProfile
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 수정한 유저 데이터
 */

export const postUserEditInfo = async function (req, res, next) {
  // remove old images
  const originalData = await userDAO.getUserInfo(res.locals.uid)
  const screenId = req.body.screenId || originalData.screenId
  const nickname = req.body.userNick || originalData.nickname
  const displayLanguage = parseInt(req.body.userDisplayLang || originalData.displayLanguage, 10)
  const availableLanguage = req.body.userAvailableLang || originalData.availableLanguage
  const intro = req.body.userIntro || originalData.intro
  let banner = {}
  let profile = {}
  if (req.files !== undefined && req.files.length !== 0) {
    if (req.files[0].fieldname === 'banner') {
      banner.origin = req.files[0].location
      banner.thumbnail = thumbPathGen(req.files[0].location.split('/'))
      profile = originalData.profile
      if (originalData?.banner) deleteImage(originalData.banner, 'mypage')
    } else {
      profile.origin = req.files[0].location
      profile.thumbnail = thumbPathGen(req.files[0].location.split('/'))
      banner = originalData.banner
      if (originalData?.profile !== null) deleteImage(originalData.profile, 'mypage')
    }
  } else {
    banner = originalData.banner
    profile = originalData.profile
  }

  try {
    const isScreenIdUnique = await userDAO.isScreenIdUnique(originalData._id, screenId)
    const newerUserData = {
      userId: res.locals.uid,
      screenId,
      nickname,
      availableLanguage:
        availableLanguage instanceof Array ? availableLanguage : availableLanguage.split(','),
      displayLanguage,
      intro,
      banner,
      profile,
    }
    if (isScreenIdUnique || screenId === originalData.screenId) {
      await userDAO.updateProfile(newerUserData)
    } else {
      throw new Error(`screenId is not Unique, isScreenIdUnique: ${isScreenIdUnique}`)
    }
    return apiResponser({ req, res, data: newerUserData})
  } catch (e) {
    return next(apiErrorGenerator(500, `알 수 없는 에러가 발생했습니다.`, e))
  }
}

/**
 * @description 비밀번호 변경
 * @access PATCH /user/changePass
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 비밀번호 변경 여부 메세지(문자열)
 */
export const changePass = async (req, res, next) => {
  const { uid } = res.locals
  const { userPw, userPwNew, userPwNewRe } = req.body

  try {
    const changePassSchema = Joi.object({
      userPw: Joi.string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/)
        .required(),
      userPwNew: Joi.string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/)
        .required(),
      userPwNewRe: Joi.string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/)
        .required(),
    })

    await changePassSchema.validateAsync({ userPw, userPwNew, userPwNewRe })
  } catch (e) {
    return next(apiErrorGenerator(400, '비밀번호 규칙을 확인해주세요.', e))
  }

  if (userPw !== userPwNew) {
    if (userPwNew === userPwNewRe) {
      try {
        const originalUserData = await userDAO.getUserInfo(uid)
        const crpytedPass = await cryptoData(userPw, originalUserData.salt)

        if (crpytedPass === originalUserData.password) {
          const saltNew = await getRandomString()
          const crpytedPassNew = await cryptoData(userPwNew, saltNew)

          await userDAO.changePass(uid, crpytedPass, crpytedPassNew, saltNew)

          return apiResponser({ req, res, message: '비밀번호 변경이 완료되었습니다.'})
        }
        return next(apiErrorGenerator(400, '기존 비밀번호와 입력이 다릅니다.'))
      } catch (e) {
        return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
      }
    } else {
      return next(apiErrorGenerator(400, '입력한 비밀번호가 일치하지 않습니다.'))
    }
  } else {
    return next(apiErrorGenerator(400, '기존 비밀번호와 같은 비밀번호로 변경할 수 없습니다.'))
  }
}

/**
 * @description 유저 탈퇴
 * @access DELETE /user
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const deleteUser = async (req, res, next) => {
  const { uid } = res.locals
  const { userPw } = req.body

  const deleteSchema = Joi.object({
    userPw: Joi.string().trim().required(),
  })

  try {
    await deleteSchema.validateAsync({ userPw })
  } catch (e) {
    return next(apiErrorGenerator(400, '비밀번호를 입력해주세요.', e))
  }

  try {
    const info = await userDAO.getUserInfo(uid)
    const crpytedPass = await cryptoData(userPw, info.salt)

    // remove old images
    deleteImage(info.banner)
    deleteImage(info.profile)

    await userDAO.deleteUser(uid, crpytedPass)
    
    return apiResponser({ req, res, message: '유저 탈퇴에 성공했습니다.'})
  } catch (e) {
    return next(apiErrorGenerator(500, '알 수 없는 에러가 발생했습니다.', e))
  }
}
