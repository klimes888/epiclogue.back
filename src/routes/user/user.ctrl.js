import crypto from 'crypto'
import util from 'util'
import { User } from '../../models'
import { s3 } from '../../lib/imageUpload'
import dotenv from 'dotenv'
import Joi from 'joi'
const randomBytesPromise = util.promisify(crypto.randomBytes)
// const crypto.pbkdf2Sync = util.promisify(crypto.pbkdf2)

dotenv.config()

/* GET users listing. */
export const getUserEditInfo = async function (req, res, next) {
  const uid = res.locals.uid
  try {
    const result = await User.getUserInfo(uid)
    
    return res.status(200).json({
      result: 'ok',
      data: {
        userNick: result.nickname,
        userIntro: result.intro,
        userCountry: result.country,
        screenId: result.screenId,
        userBannerImg: result.banner,
        userProfileImg: result.profile,
        email: result.email,
      },
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}

export const postUserEditInfo = async function (req, res, next) {
  // remove old images
  const originalData = await User.getUserInfo(res.locals.uid)
  const originalImages = [originalData.banner, originalData.profile]
  const screenId = req.body['screenId'] || originalData.screenId
  const nickname = req.body['userNick'] || originalData.nickname
  const country = parseInt(req.body['userCountry']) || originalData.country
  const availableLanguage = req.body['userLang'] || originalData.availableLanguage
  const intro = req.body['userIntro'] || originalData.intro
  const beDeletedImages = []
  let banner
  let profile

  for (let each of originalImages) {
    if (each) { // null check
      const texts = each.split('/')
      let obj = {
        Key: texts[3]
      }
      beDeletedImages.push(obj)
    }
  }

  // ok
  if (beDeletedImages.length !== 0) {
    s3.deleteObjects({
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: beDeletedImages
      }
    }, (err, data) => {
      if (err) console.log(err)
    })
  }

  if (req.files !== undefined) {
    if (req.files.length > 1) {
      if (req.files[0].fieldname == 'userBannerImg') {
        banner = req.files[0].location
        profile = req.files[1].location
      } else {
        banner = req.files[1].location
        profile = req.files[0].location
      }
    } else if (req.files.length == 1) {
      if (req.files[0].fieldname == 'userBannerImg') {
        banner = req.files[0].location
      } else {
        profile = req.files[0].location
      }
    }
  } else {
    banner = originalData.banner
    profile = originalData.profile
  }

  try {
    const checkId = await User.isScreenIdUnique(screenId)
    if (checkId || screenId === originalData.screenId) {
      const newerUserData = {
        userId: res.locals.uid,
        screenId,
        nickname,
        availableLanguage,
        country,
        intro,
        banner,
        profile,
      }

      await User.updateProfile(newerUserData)
      console.log(`[INGO] 유저 ${res.locals.uid}가 프로필을 수정했습니다.`)
      return res.status(200).json({
        result: 'ok',
        data: newerUserData,
      })
    } else {
      return res.status(400).json({
        result: 'error',
        message: 'screenId가 중복됩니다.',
      })
    }
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}

export const changePass = async function (req, res, next) {
  const uid = res.locals.uid
  const userPw = req.body['userPw']
  const userPwNew = req.body['newUserPw']
  const userPwNewRe = req.body['newUserPwRe']

  try {
    const changePassSchema = Joi.object({
      userPw: Joi.string().required().min(8),
      userPwNew: Joi.string().required().min(8),
      userPwNewRe: Joi.string().required().min(8)
    })

    await changePassSchema.validateAsync({ userPw, userPwNew, userPwNewRe })

    if (userPw !== userPwNew) {
      if (userPwNew === userPwNewRe) {
        const check = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(userPwNew)

        if (check) {
          try {
            const originalUserData = await User.getUserInfo(uid)
            const salt = originalUserData.salt 
            const newPassword = await crypto.pbkdf2Sync(userPwNew, salt, parseInt(process.env.EXEC_NUM), parseInt(process.env.RESULT_LENGTH), 'sha512')
            if (originalUserData.password === newPassword) {
              console.error(`[INFO] Same password detected`)
              process.exit(1)
            }

            const info = await User.getUserInfo(uid)
            const saltNew = await randomBytesPromise(64)
            const crypt_Pw = await crypto.pbkdf2Sync(
              userPw,
              info['salt'],
              parseInt(process.env.EXEC_NUM),
              parseInt(process.env.RESULT_LENGTH),
              'sha512'
            )
            const crypt_PwNew = await crypto.pbkdf2Sync(
              userPwNew,
              saltNew.toString('base64'),
              parseInt(process.env.EXEC_NUM),
              parseInt(process.env.RESULT_LENGTH),
              'sha512'
            )
            await User.changePass(
              uid,
              crypt_Pw.toString('base64'),
              crypt_PwNew.toString('base64'),
              saltNew.toString('base64')
            )
            console.log(`[INFO] 유저 ${res.locals.uid} 가 비밀번호를 변경했습니다.`)
            return res.status(200).json({
              result: 'ok',
              message: '비밀번호 변경 완료',
            })
          } catch (e) {
            console.error(`[Error] ${e}`)
            return res.status(500).json({
              result: 'error',
              message: e.message,
            })
          }
        } else {
          console.warn(`[WARN] 유저 ${res.locals.uid} 의 비밀번호 변경이 실패했습니다: 비밀번호 규칙 미준수`)
          return res.status(400).json({
            result: 'error',
            message: '비밀번호 규칙을 다시 확인해주세요.',
          })
        }
      } else {
        console.warn(`[WARN] 유저 ${res.locals.uid} 의 비밀번호 변경이 실패했습니다: 새로운 비밀번호 미일치`)
        return res.status(400).json({
          result: 'error',
          message: '재입력된 비밀번호가 일치하지 않습니다.',
        })
      }
    } else {
      console.warn(`[WARN] 유저 ${res.locals.uid} 의 비밀번호 변경이 실패했습니다: 기존 비밀번호와 동일`)
      res.status(400).json({
        result: 'error',
        message: '기본 비밀번호와 동일한 비밀번호는 사용할 수 없습니다.',
      })
    }
  } catch (e) {
    console.warn(`[WARN] 유저 ${res.locals.uid} 의 비밀번호 변경 실패: ${e}`)
    return res.status(400).json({
      result: 'error',
      message: '비밀번호 유효성 검사 미통과'
    })
  }
}

export const deleteUser = async function (req, res, next) {
  const uid = res.locals.uid
  const userPw = req.body['userPw']

  try {
    const deleteSchema = Joi.object({
      userPw: Joi.string().required()
    })

    try {
      await deleteSchema.validateAsync({ userPw })
    } catch (e) {
      console.warn(`[WARN] 유저 ${uid} 가 탈퇴에 실패했습니다: 비밀번호 미입력`)
      return res.status(400).json({
        result: 'error',
        message: '패스워드를 입력해주세요.'
      })
    }

    const info = await User.getUserInfo(uid)
    const crypt_Pw = await crypto.pbkdf2Sync(
      userPw,
      info['salt'],
      parseInt(process.env.EXEC_NUM),
      parseInt(process.env.RESULT_LENGTH),
      'sha512'
    )

    // remove old images
    const originalData = await User.getUserInfo(res.locals.uid)
    const originalImages = [originalData.banner, originalData.profile]
    // console.log(originalImages)
    const beDeletedImages = []
    for (let each of originalImages) {
      if (each) { // null check
        const texts = each.split('/')
        let obj = {
          Key: texts[3]
        }
        beDeletedImages.push(obj)
      }
    }

    // console.log(beDeletedImages)

    if (beDeletedImages.length !== 0) {
      s3.deleteObjects({
        Bucket: process.env.AWS_BUCKET_NAME,
        Delete: {
          Objects: beDeletedImages
        }
      }, (err, data) => {
        if (err) console.log(err)
      })
    }

    const deletion = await User.deleteUser(uid, crypt_Pw.toString('base64'))

    if (deletion.ok === 1) {
      if (deletion.n === 1) {
        console.log(`[INFO] 유저 ${res.locals.uid} 가 탈퇴했습니다.`)
        return res.status(200).json({
          result: 'ok',
        })
      } else if (deletion.n === 0) {
        console.warn(`[WARN] 탈퇴하려는 유저 ${res.locals.uid} 가 비밀번호를 다르게 입력했습니다.`)
        return res.status(400).json({
          result: 'error',
          message: '존재하지 않는 데이터에 접근했습니다.',
        })
      }
    } else {
      return res.status(500).json({
        result: 'error',
        message: '데이터베이스 질의 실패',
      })
    }
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}
