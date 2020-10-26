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
import transporter from '../../lib/sendMail'
import user from '../../models/user'

/* 
  This is auth router. 
  base url: /auth
  OPTIONS: [ GET / POST ]
*/

dotenv.config()

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
    try { // user input validation
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

  const session = await startSession()  
  await session.startTransaction()

  try {
    try { // user input validation
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
        }, session)
        
        throw new Error("tx err")
        // await session.commitTransaction()
        if (result) {
          const option = {
            from: process.env.MAIL_USER,
            to: email,
            subject: '이메일 인증을 완료해주세요.',
            html: `
              <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
              <html html="" xmlns="http://www.w3.org/1999/xhtml" style="margin: 0; padding: 0;">
              
              <head>
                  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                  <title>Document</title>
                  
              </head>
              
              <body style="margin: 0; padding: 0; background: #F7F7F7;">
                  <center class="wrapper" style="margin: 0; padding: 0; width: 100%; table-layout: fixed; background: #2222; padding-bottom: 30px;">
                      <div class="webkit" style="margin: 0; padding: 0; max-width: 480px; background: #fff;">
                          <table class="templet" align="center" style="border-collapse: collapse; border-radius: 12px; margin: 0 auto; width: 100%; text-align: center; border-spacing: 0; padding: 20px; font-family: sans-serif; color: #6A6877;" width="100%">
                              <tr style="margin: 0; padding: 0;">
                                  <td style="margin: 0; padding: 0;">
                                      <table width="100%" style="margin: 0; padding: 0; border-collapse: collapse; border-spacing: 0;">
                                          <tr style="margin: 0; padding: 0;">
                                              <td style="margin: 0; padding: 0; background: #fff; padding-top: 20px; text-align: center;" align="center">
                                                  <p style="margin: 0; padding: 0; font-size: 24px; font-weight: 700; color: rgba(21, 146, 230, 0.8);">welcome to EpicLogue</p>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                              <table width="100%" style="margin: 0; padding: 0; border-collapse: collapse; border-spacing: 0;" align="center">
                                  <tr style="margin: 0; padding: 0;">
                                      <td style="margin: 0; padding: 0; text-align: center; margin-left: 0 auto;" align="center">
                                          <p style="margin: 0; padding: 0; font-size: 20px; font-weight: 700; color: rgb(113,113,113); margin-top: 12px; margin-bottom: 18px;">Where imagination comes true!</p>
              
              
                                      </td>
                                  </tr>
                              </table>
                              <tr style="margin: 0; padding: 0;">
                                  <td style="margin: 0; padding: 0;">
                                      <p class="contents" style="margin: 0; font-size: 16px; font-weight: 600; color: #6A6877; padding: 12px 0;">더 많은 작품을 공유해보세요</p>
                                  </td>
                              </tr>
                              <tr style="margin: 0; padding: 0;">
                                  <td style="margin: 0; padding: 0;">
                                      <p class="contents" style="margin: 0; font-size: 16px; font-weight: 600; color: #6A6877; padding: 12px 0;">더욱 편리한 서비스를 느껴보세요</p>
                                  </td>
                              </tr>
                              <tr style="margin: 0; padding: 0;">
                                  <td style="margin: 0; padding: 0;">
                                      <p class="contents" style="margin: 0; font-size: 16px; font-weight: 600; color: #6A6877; padding: 12px 0;">작가와 직접 소통 해보세요</p>
                                  </td>
                              </tr>
                              <tr style="margin: 0; padding: 0;">
                                  <td style="margin: 0; padding: 0;">
                                      <div style="padding: 0; border: 2px solid #2222; margin: 25px 40px;"></div>
                                  </td>
                              </tr>
                              <tr style="margin: 0; padding: 0;">
                                  <td style="margin: 0; padding: 0;">
                                      <p style="margin: 0; padding: 0; padding-bottom: 30px; font-size: 16px; color: rgba(21, 146, 230, 1); font-weight: 700;">인증버튼을 클릭 하시면 서비스 이용이 가능해요</p>
                                  </td>
                              </tr>
                                              <tr style="margin: 0; padding: 0;">
                                  <td style="margin: 0; padding: 0;">
                                      <a href="https://api.epiclogue.tk/auth/mailAuth?email=${email}&token=${auth_token}" style="margin: 0; padding: 0;"><button class="button" style="margin: 0; padding: 0; all: unset; display: inline-block; width: 70%; height: 42px; background: rgba(21, 146, 230, 0.8); border-radius: 25px; font-size: 16px; font-weight: 700; line-height: 42px; text-decoration: none; color: #fff;">인증하기</button></a>
                                  </td>
                              </tr>
                                                              <tr style="margin: 0; padding: 0;">
                                  <td style="margin: 0; padding: 0;">
                                      <p style="margin: 0; padding: 40px 0; font-size: 12px; font-weight: 700; color: #A6A4B2;">Designed by Lunarcat</p>
                                  </td>
                              </tr>
                          </table>
                      </div>
                  </center>
              </body>
              
              </html>
            `,
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
    await session.abortTransaction()
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  } finally {
    session.endSession()
  }
}

export const mailAuth = async function (req, res, next) {
  const email = req.query.email
  const token = req.query.token
  try {
    const result = await User.isConfirmed(email, token)
    if (result) {
      await User.confirmUser(email)
      console.log(`[INFO] 유저 ${res.locals.uid} 의 이메일 인증이 완료되었습니다.`)
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

export const test = async (req, res, next) => {
  const email = req.body['email']
  const userPw = req.body['userPw']
  const nick = req.body['userNick']

  const userData = {
    email,
    password: userPw,
    nickname: nick
  }

  const session = await startSession()
  // session.startTransaction()

  try {
    await session.withTransaction(async () => {
      const userSchema = new User(userData);
      await userSchema.save({ session })
      throw new Error(`tx error`)
      // return res.sendStatus(201)
    })
  } catch (e) {
    next(createError(500, e))
  } finally {
    await session.endSession()
    const failureData = await User.findOne({ email: userData.email }, { email: 1, _id: 0})
    console.log(failureData)
  }
  

  // try {
  //   await User.create(userData)
  //   await session.abortTransaction()
  //   return res.status(201).json({
  //     result: 'ok'
  //   })
  // } catch (e) {
  //   await session.abortTransaction()
  //   next(createError(500, e))
  // } finally {
  //   session.endSession()
  // }
}