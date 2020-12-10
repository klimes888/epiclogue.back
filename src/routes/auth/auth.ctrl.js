import { User } from '../../models'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import util from 'util'
import crypto from 'crypto'
import Joi from 'joi'
import createError from 'http-errors'
import { startSession } from 'mongoose'
const SECRET_KEY = process.env.SECRET_KEY
const randomBytesPromise = util.promisify(crypto.randomBytes)
import transporter, { emailText, findPassText } from '../../lib/sendMail'

/* 
  This is auth router. 
  base url: /auth
  OPTIONS: [ GET / POST ]
*/

dotenv.config()

export const snsLogin = async function (req, res, next) {
  const userData = req.body.userData
  const snsType = req.body.snsType
  console.log(userData, snsType)
  return res.status(200).json({
    result: 'ok',
    token: userData,
  })
  // 유저 존재여부 확인 후 있으면 db 저장, 없으면 바로 로그인 처리 조건문 요구
  // db에 추가되는 sns유저 정보는 아래와 같음
  // email, token, nickname, snsType
  // sns유저는 회원가입 절차가 없으므로 기존의 이메일 인증토큰용 컬럼을 재활용
}

export const login = async function (req, res, next) {
  const email = req.body['email']
  const userPw = req.body['userPw']

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

    const user = await User.getSalt(email)

    if (user) {
      const crypt_Pw = crypto.pbkdf2Sync(
        userPw,
        user['salt'],
        parseInt(process.env.EXEC_NUM),
        parseInt(process.env.RESULT_LENGTH),
        'sha512'
      )

      const result = await User.findUser(email, crypt_Pw.toString('base64'))

      if (result) {
        const token = jwt.sign(
          {
            nick: result['nickname'],
            uid: result['_id'],
            isConfirmed: result['isConfirmed'],
          },
          SECRET_KEY,
          {
            expiresIn: process.env.JWT_EXPIRES_IN,
          }
        )
        console.log(`[INFO] 유저 ${result._id} 가 로그인했습니다.`)
        return res.status(200).json({
          result: 'ok',
          token,
          nick: result.nickname,
          screenId: result.screenId,
        })
      } else {
        console.log(`[INFO] 유저 ${email} 가 다른 비밀번호 ${userPw} 로 로그인을 시도했습니다.`)
        return next(createError(400, '잘못된 비밀번호입니다.'))
      }
    } else {
      console.log(`[INFO] 존재하지 않는 유저 ${email} 가 로그인을 시도했습니다.`)
      return next(createError(404, '존재하지 않는 유저입니다.'))
    }
  } catch (e) {
    console.log(`[Error] 알 수 없는 오류가 발생했습니다. ${e}`)
    return next(createError(500, `알 수 없는 오류가 발생했습니다.`))
  }
}

export const join = async function (req, res, next) {
  const email = req.body['email']
  const userPw = req.body['userPw']
  const userPwRe = req.body['userPwRe']
  const nick = req.body['userNick']
  const check = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(userPw)

  const joinValidationSchema = Joi.object({
    email: Joi.string()
      .regex(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i)
      .required(),
    userPw: Joi.string().required(),
    userPwRe: Joi.string().required(),
    nick: Joi.string().trim().required(),
  })

  try {
    try {
      // user input validation
      /* 
        validate를 사용하면 try-catch를 사용할 수 없고
        await 를 붙이지 않으면 unhandled promise error 가 나온다...
      */
      await joinValidationSchema.validateAsync({ email, userPw, userPwRe, nick })
    } catch (e) {
      console.log(`[INFO] 유저 ${email} 가 적절하지 않은 데이터로 가입하려 했습니다. ${e}`)
      return next(createError(400, '적절하지 않은 값을 입력했습니다.'))
    }

    if (check) {
      if (userPw == userPwRe) {
        /* 중복 가입 이메일 처리 */
        if ((await User.isExist(email)) != null) {
          console.log(`[INFO] 중복된 이메일 ${email} 로 가입하려했습니다.`)
          return next(createError(400, '중복된 이메일입니다. 다른 이메일로 가입해주세요.'))
        }

        const generatedId = crypto.createHash('sha256').update(email).digest('hex').slice(0, 14)
        const salt = await randomBytesPromise(64)
        const crypt_Pw = crypto.pbkdf2Sync(
          userPw,
          salt.toString('base64'),
          parseInt(process.env.EXEC_NUM),
          parseInt(process.env.RESULT_LENGTH),
          'sha512'
        )
        const auth_token = crypt_Pw.toString('hex').slice(0, 24)
        const result = await User.create({
          email: email,
          password: crypt_Pw.toString('base64'),
          salt: salt.toString('base64'),
          nickname: nick,
          token: auth_token,
          screenId: generatedId,
        })

        if (result) {
          const option = {
            from: process.env.MAIL_USER,
            to: email,
            subject: '이메일 인증을 완료해주세요.',
            html: emailText(email, auth_token),
          }
          transporter.sendMail(option, function (error, info) {
            if (error) {
              console.error(
                `[ERROR] ${email} 에게 메일을 보내는 도중 문제가 발생했습니다. ${error}`
              )
              return next(createError(500, `알 수 없는 오류가 발생했습니다.`))
            } else {
              console.log(`[INFO] ${email} 에게 성공적으로 메일을 보냈습니다: ${info.response}`)
              return res.status(201).json({
                result: 'ok',
                info: info.response,
              })
            }
          })
        } else {
          console.log(`[INFO] 이미 존재하는 이메일 ${email} 로 회원가입을 시도했습니다.`)
          return next(createError(400, '이미 존재하는 아이디입니다. 확인 후 시도해주세요.'))
        }
      } else {
        console.log(`[INFO] 일치하지 않는 패스워드로 가입하려했습니다.`)
        return next(createError(400, '비밀번호가 일치하지 않습니다.'))
      }
    } else {
      console.log(`[INFO] 회원가입 비밀번호 규칙이 맞지 않습니다.`)
      return next(createError(400, '비밀번호 규칙을 다시 확인해주세요.'))
    }
  } catch (e) {
    console.error(`[ERROR] 알 수 없는 에러가 발생했습니다. ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

export const findPass = async (req, res, next) => {
  const { email } = req.body
  
  const option = {
    from: process.env.MAIL_USER,
    to: email,
    subject: '비밀번호 재설정을 위해 이메일 인증을 완료해주세요.',
    html: findPassText(email),
  }

  try {
    const userToken = await crypto.randomBytesPromise(24);
    await User.updateOne({ email }, { $set: { token: userToken.toString('hex') }})
    await transporter.sendMail(option)
    console.log(`[INFO] ${email} 에게 성공적으로 메일을 보냈습니다`)
    return res.status(201).json({
      result: 'ok',
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(e))
  }
}

export const mailAuth = async function (req, res, next) {
  const email = req.query.email
  const token = req.query.token
  try {
    const result = await User.isConfirmed(email, token)
    if (result) {
      await User.confirmUser(email)
      console.log(`[INFO] 유저 ${email} 의 이메일 인증이 완료되었습니다.`)
      return res.status(200).json({
        result: 'ok',
      })
    } else {
      console.log(`[INFO] 이메일 ${email} 의 이메일 인증이 실패했습니다.`)
      return next(createError(401, '이메일 인증에 실패했습니다.'))
    }
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}
