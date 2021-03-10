import Joi from 'joi'
import createError from 'http-errors'
import { deleteImage, thumbPathGen } from '../../lib/imageCtrl'
import { userDAO } from '../../DAO'
import { cryptoData, getRandomString } from '../../lib/cryptoData'

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

    return res.status(200).json({
      result: 'ok',
      data: result,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError('알 수 없는 에러가 발생했습니다.'))
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
    const isScreenIdUnique = await userDAO.isScreenIdUnique(screenId)
    const newerUserData = {
      userId: res.locals.uid,
      screenId,
      nickname,
      availableLanguage,
      displayLanguage,
      intro,
      banner,
      profile,
    }
    if(isScreenIdUnique) {
      await userDAO.updateProfile(newerUserData)
    } else {
      throw new Error(`screenId is not Unique, isScreenIdUnique: ${isScreenIdUnique}`)
    }
    console.log(`[INGO] 유저 ${res.locals.uid}가 프로필을 수정했습니다.`)
    return res.status(200).json({
      result: 'ok',
      data: newerUserData,
    })
  } catch (e) {
    console.error(
      `[Error] 유저 ${res.locals.uid} 가 프로필 변경에 실패했습니다`
    )
    console.error(`[Error] ${e}`)
    return next(createError(400, `프로필 변경중 에러가 발생했습니다. ${e}`))
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
    console.log(`[INFO] 유저 ${res.locals.uid} 의 비밀번호 변경 실패: ${e}`)
    return next(createError(400, '비밀번호 규칙을 확인해주세요.'))
  }

  if (userPw !== userPwNew) {
    if (userPwNew === userPwNewRe) {
      try {
        const originalUserData = await userDAO.getUserInfo(uid)
        const saltNew = await getRandomString()
        const crpytedPass = await cryptoData(userPw, originalUserData.salt)
        const crpytedPassNew = await cryptoData(userPwNew, saltNew)

        await userDAO.changePass(uid, crpytedPass, crpytedPassNew, saltNew)

        console.log(`[INFO] 유저 ${res.locals.uid} 가 비밀번호를 변경했습니다.`)
        return res.status(200).json({
          result: 'ok',
          message: '비밀번호 변경 완료',
        })
      } catch (e) {
        console.error(
          `[ERROR] 유저 ${res.locals.uid} 의 비밀번호 변경이 실패했습니다: 데이터베이스 질의에 실패했습니다.`
        )
        console.error(`[Error] ${e}`)
        return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
      }
    } else {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 의 비밀번호 변경이 실패했습니다: 새로운 비밀번호 미일치`
      )
      return next(createError(400, '비밀번호과 재입력이 다릅니다.'))
    }
  } else {
    console.log(
      `[INFO] 유저 ${res.locals.uid} 의 비밀번호 변경이 실패했습니다: 기존 비밀번호와 동일`
    )
    return next(createError(400, '기존 비밀번호과 같은 비밀번호는 사용할 수 없습니다.'))
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
    console.log(`[INFO] 유저 ${uid} 가 탈퇴에 실패했습니다: 비밀번호 미입력`)
    return next(createError(400, '비밀번호를 입력해주세요.'))
  }

  try {
    const info = await userDAO.getUserInfo(uid)
    const crpytedPass = await cryptoData(userPw, info.salt)

    // remove old images
    deleteImage(info.banner)
    deleteImage(info.profile)

    await userDAO.deleteUser(uid, crpytedPass)
    console.log(`[INFO] 유저 ${res.locals.uid} 가 탈퇴했습니다.`)
    return res.status(200).json({
      result: 'ok',
    })
  } catch (e) {
    console.error(
      `[ERROR] 유저 ${res.locals.uid} 가 탈퇴에 실패했습니다: 데이터베이스 질의에 실패했습니다.`
    )
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다. 입력정보를 다시 확인해주세요.'))
  }
}
