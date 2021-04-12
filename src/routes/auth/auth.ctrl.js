import Joi from 'joi'
import createError from 'http-errors'
import '../../env/env'
import { userDAO } from '../../DAO'
import { sendMail, emailText, findPassText } from '../../lib/sendMail'
import { joinDataCrypt, cryptoData, getRandomToken, getRandomString } from '../../lib/cryptoData'
import { cookieOption } from '../../options/options'
import { generateToken } from '../../lib/tokenManager'

/**
 * @description SNS 로그인
 * @access POST /auth/snsLogin
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 로그인 정보 및 토큰
 */
export const snsLogin = async function (req, res, next) {
  const { snsData, snsType, userLang } = req.body
  const userData = {
    uid: snsData.profileObj.googleId,
    email: snsData.profileObj.email,
    profile: snsData.profileObj.imageUrl,
    name: snsData.profileObj.name,
  }
  let result = await userDAO.isExistSns(userData.uid)

  if (!result) {
    const { password, salt, screenId, token } = await joinDataCrypt(userData.email, userData.email)
    result = await userDAO.create({
      email: userData.email,
      password,
      salt,
      nickname: userData.name,
      token,
      screenId,
      displayLanguage: userLang,
      profile: userData.profile,
      snsId: userData.uid,
      snsType,
      isConfirmed: true,
    })
  }

  if (result.deactivatedAt != null) {
    return next(createError(404, '탈퇴한 계정입니다.'))
  }

  const token = await generateToken(result.nickname, result._id, result.isConfirmed)

  res.cookie('access_token', token, cookieOption)
  console.log(`[INFO] SNS유저 ${result._id} 가 로그인했습니다.`)
  return res.status(200).json({
    result: 'ok',
    nick: result.nickname,
    screenId: result.screenId,
    displayLanguage: result.displayLanguage,
  })
}
/**
 * @description 로그아웃
 * @access POST /auth/logout
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 로그아웃 여부 응답
 */

export const logout = async (req, res, next) => {
  const { uid } = res.locals
  if(uid) {
    console.log(`${ uid } 유저가 로그아웃 했습니다.`)
    res.clearCookie('access_token')
  } else {
    console.error(`${ req.headers['x-forwarded-for'] }에서 비정상적인 로그아웃 요청을 했습니다.`)
    next(createError(400, '비정상적 요청입니다.'))
  }
  return res.status(200).json({
    result: 'ok'
  })
}

/**
 * @description 로그인
 * @access POST /auth/login
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 로그인 정보 및 토큰
 */
export const login = async function (req, res, next) {
  const { email, userPw } = req.body

  const loginValidationSchema = Joi.object({
    email: Joi.string()
      .regex(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i)
      .required(),
    userPw: Joi.string().required(),
  })

  try {
    try {
      // user input validation
      await loginValidationSchema.validateAsync({ email, userPw })
    } catch (e) {
      console.log(
        `[INFO] ${
          req.headers['x-forwarded-for'] || req.connection.remoteAddress
        } 에서 적절하지 않은 로그인 데이터를 입력했습니다: email: ${email}, password: ${userPw}`
      )
      return next(createError(400, '적절하지 않은 값을 입력했습니다.'))
    }

    const user = await userDAO.getSalt(email)

    if (user) {
      const cryptedPass = await cryptoData(userPw, user.salt)

      const result = await userDAO.findUser(email, cryptedPass)

      if (result) {
        if (result.deactivatedAt != null) {
          return next(createError(404, '탈퇴한 계정입니다.'))
        }

        const token = await generateToken(result.nickname, result._id, result.isConfirmed)
        res.cookie('access_token', token, cookieOption)
        console.log(`[INFO] 유저 ${result._id} 가 로그인했습니다.`)
        return res.status(200).json({
          result: 'ok',
          nick: result.nickname,
          screenId: result.screenId,
          displayLanguage: result.displayLanguage,
        })
      }
      console.log(`[INFO] 유저 ${email} 가 다른 비밀번호 ${userPw} 로 로그인을 시도했습니다.`)
      return next(createError(400, '잘못된 비밀번호입니다.'))
    }
    console.log(`[INFO] 존재하지 않는 유저 ${email} 가 로그인을 시도했습니다.`)
    return next(createError(404, '존재하지 않는 유저입니다.'))
  } catch (e) {
    console.log(`[Error] 알 수 없는 오류가 발생했습니다. ${e}`)
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'))
  }
}

/**
 * @description 회원가입
 * @access POST /auth/join
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const join = async function (req, res, next) {
  const { email, userPw, userPwRe, userLang, userNick: nick } = req.body
  const p = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/
  const check = p.test(userPw)

  const joinValidationSchema = Joi.object({
    email: Joi.string()
      .regex(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i)
      .required(),
    userPw: Joi.string().required(),
    userPwRe: Joi.string().required(),
    nick: Joi.string().trim().required(),
    userLang: Joi.number().required(),
  })

  try {
    try {
      // user input validation
      /*
        validate를 사용하면 try-catch를 사용할 수 없고
        await 를 붙이지 않으면 unhandled promise error 가 나온다...
      */
      await joinValidationSchema.validateAsync({
        email,
        userPw,
        userPwRe,
        nick,
        userLang,
      })
    } catch (e) {
      console.log(`[INFO] 유저 ${email} 가 적절하지 않은 데이터로 가입하려 했습니다. ${e}`)
      return next(createError(400, '적절하지 않은 값을 입력했습니다.'))
    }

    if (check) {
      if (userPw === userPwRe) {
        /* 중복 가입 이메일 처리 */
        if ((await userDAO.isExist(email)) != null) {
          console.log(`[INFO] 중복된 이메일 ${email} 로 가입하려했습니다.`)
          return next(createError(400, '중복된 이메일입니다. 다른 이메일로 가입해주세요.'))
        }

        const { screenId, salt, password, token } = await joinDataCrypt(email, userPw)
        const result = await userDAO.create({
          email,
          password,
          salt,
          nickname: nick,
          token,
          screenId,
          displayLanguage: userLang,
        })

        if (result) {
          try {
            await sendMail(email, '이메일 인증을 완료해주세요.', emailText(email, token))
            return res.status(201).json({
              result: 'ok',
            })
          } catch (e) {
            console.error(`[ERROR] ${email} 에게 메일을 보내는 도중 문제가 발생했습니다. ${e}`)
            return next(createError(500, '알 수 없는 오류가 발생했습니다.'))
          }
        } else {
          console.log(`[INFO] 이미 존재하는 이메일 ${email} 로 회원가입을 시도했습니다.`)
          return next(createError(400, '이미 존재하는 아이디입니다. 확인 후 시도해주세요.'))
        }
      } else {
        console.log('[INFO] 일치하지 않는 패스워드로 가입하려했습니다.')
        return next(createError(400, '비밀번호가 일치하지 않습니다.'))
      }
    } else {
      console.log('[INFO] 회원가입 비밀번호 규칙이 맞지 않습니다.')
      return next(createError(400, '비밀번호 규칙을 다시 확인해주세요.'))
    }
  } catch (e) {
    console.error(`[ERROR] 알 수 없는 에러가 발생했습니다. ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

/**
 * @description 비밀번호 찾기를 위해 메일 전송
 * @access POST /auth/findpass
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const mailToFindPass = async (req, res, next) => {
  const { email } = req.body
  const userToken = await getRandomToken()

  try {
    await userDAO.setTokenForAuth(email, userToken)
    await sendMail(
      email,
      '비밀번호 재설정을 위해 이메일 인증을 완료해주세요.',
      findPassText(email, userToken)
    )
    return res.status(201).json({
      result: 'ok',
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(e))
  }
}

/**
 * @description 유저 비밀번호 변경
 * @access PATCH /auth/findpass
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const findPass = async (req, res, next) => {
  const { email, userPwNew, userPwNewRe, token } = req.body
  const changePassSchema = Joi.object({
    userPwNew: Joi.string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/)
      .required(),
    userPwNewRe: Joi.string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/)
      .required(),
  })

  /* Check password validation */
  try {
    await changePassSchema.validateAsync({ userPwNew, userPwNewRe })
  } catch (e) {
    console.log(`[INFO] 유저 ${email} 의 비밀번호 변경 실패: ${e}`)
    return next(createError(400, '비밀번호 규칙을 확인해주세요.'))
  }

  try {
    if (userPwNew === userPwNewRe) {
      const authUser = await userDAO.isConfirmed(email, token)
      if (authUser) {
        const newSalt = await getRandomString()
        const newPass = await cryptoData(userPwNew, newSalt)

        await userDAO.resetPass(email, newSalt, newPass)

        console.log(`[INFO] 유저 ${email} 가 비밀번호 변경에 성공했습니다.`)
        return res.status(200).json({
          result: 'ok',
          message: '새로운 비밀번호로 로그인해주세요.',
        })
      }
      console.log(`[INFO] 유저 ${email} 가 잘못된 토큰 ${token} 으로 비밀번호 변경을 시도했습니다.`)
      return next(createError(401, '적절하지 않은 인증입니다.'))
    }
    console.log(
      `[INFO] 유저 ${email} 서로 다른 비밀번호 ${userPwNew}, ${userPwNewRe} 로 비밀번호 변경을 시도했습니다.`
    )
    return next(createError(400, '비밀번호가 다릅니다.'))
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError('알 수 없는 에러가 발생했습니다.'))
  }
}

/**
 * @description 유저의 메일 인증
 * @access GET /auth/mailAuth
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const mailAuth = async function (req, res, next) {
  const { email, token } = req.query

  try {
    const result = await userDAO.isConfirmed(email, token)
    if (result) {
      await userDAO.confirmUser(email)
      console.log(`[INFO] 유저 ${email} 의 이메일 인증이 완료되었습니다.`)
      return res.status(200).json({
        result: 'ok',
      })
    }
    console.log(`[INFO] 이메일 ${email} 의 이메일 인증이 실패했습니다.`)
    return next(createError(401, '이메일 인증에 실패했습니다.'))
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}
