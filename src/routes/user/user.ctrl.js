import crypto from 'crypto'
import util from 'util'
import { User } from '../../models'
import dotenv from 'dotenv'
const randomBytesPromise = util.promisify(crypto.randomBytes)
const pbkdf2Promise = util.promisify(crypto.pbkdf2)

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
  const originalData = await User.getUserInfo(res.locals.uid)

  const screenId = req.body['screenId'] || originalData.screenId
  const nickname = req.body['userNick'] || originalData.nickname
  const country = parseInt(req.body['userCountry']) || originalData.country
  const availableLanguage = req.body['userLang'] || originalData.availableLanguage
  const intro = req.body['userIntro'] || originalData.intro

  /* 이미지 length에 관련되어 에러가 발생하기 때문에 기본 이미지로 변경한다면 이에 대한 처리 필요 */

  let banner
  let profile
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

  if (userPw != userPwNew) {
    if (userPwNew == userPwNewRe) {
      const check = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(
        userPwNew
      )

      if (check) {
        try {
          const info = await User.getUserInfo(uid)
          const saltNew = await randomBytesPromise(64)
          const crypt_Pw = await pbkdf2Promise(
            userPw,
            info['salt'],
            parseInt(process.env.EXEC_NUM),
            parseInt(process.env.RESULT_LENGTH),
            'sha512'
          )
          const crypt_PwNew = await pbkdf2Promise(
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
        return res.status(400).json({
          result: 'error',
          message: '비밀번호 규칙을 다시 확인해주세요.',
        })
      }
    } else {
      return res.status(400).json({
        result: 'error',
        message: '재입력된 비밀번호가 일치하지 않습니다.',
      })
    }
  } else {
    res.status(400).json({
      result: 'error',
      message: '기본 비밀번호와  동일한 비밀번호는 사용할 수 없습니다.',
    })
  }
}

export const deleteUser = async function (req, res, next) {
  const uid = res.locals.uid
  const userPw = req.body['userPw']

  try {
    const info = await User.getUserInfo(uid)
    const crypt_Pw = await pbkdf2Promise(
      userPw,
      info['salt'],
      parseInt(process.env.EXEC_NUM),
      parseInt(process.env.RESULT_LENGTH),
      'sha512'
    )

    const deletion = await User.deleteUser(uid, crypt_Pw.toString('base64'))

    if (deletion.ok === 1) {
      if (deletion.n === 1 && deletion.n === deletion.deletedCount) {
        return res.status(200).json({
          result: 'ok',
        })
      } else if (deletion.ok === 1 && deletion.n !== deletion.deletedCount) {
        return res.status(200).json({
          result: 'ok',
          message: '질의에 성공했으나 데이터가 삭제되지 않았습니다.',
        })
      } else if (deletion.n === 0) {
        return res.status(404).json({
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
