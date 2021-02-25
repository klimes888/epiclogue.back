import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import util from 'util';
import crypto from 'crypto';
import Joi from 'joi';
import createError from 'http-errors';
import axios from 'axios';
import { User } from '../../models';
import transporter, { emailText, findPassText } from '../../lib/sendMail';

const { SECRET_KEY } = process.env;
const randomBytesPromise = util.promisify(crypto.randomBytes);

dotenv.config();

const getFBProfile = async uid => {
  return new Promise(async (resolve, reject) => {
    axios({
      url: `https://graph.facebook.com/v9.0/${uid}/picture`,
      method: 'GET',
    })
      .then(res => resolve(res.request.res.responseUrl))
      .catch(err => reject(err));
  });
}

/**
 * @description SNS 로그인
 * @access POST /auth/snsLogin
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 로그인 정보 및 토큰
 */
export const snsLogin = async function (req, res, next) {
  const { snsData, snsType, userLang } = req.body;
  const userData =
    snsType === 'google'
      ? {
          uid: snsData.profileObj.googleId,
          email: snsData.profileObj.email,
          profile: snsData.profileObj.imageUrl,
          name: snsData.profileObj.name,
        }
      : {
          uid: snsData.id,
          email: snsData.email,
          profile: await getFBProfile(snsData.id),
          name: snsData.name,
        };
  let result = await User.isExistSns(userData.uid);

  if (!result) {
    const generatedId = crypto
      .createHash('sha256')
      .update(userData.email)
      .digest('hex')
      .slice(0, 14);
    const salt = await randomBytesPromise(64);
    const cryptedEmail = crypto.pbkdf2Sync(
      userData.email,
      salt.toString('base64'),
      parseInt(process.env.EXEC_NUM, 10),
      parseInt(process.env.RESULT_LENGTH, 10),
      'sha512'
    );
    const authToken = cryptedEmail.toString('hex').slice(0, 24);
    result = await User.create({
      email: userData.email,
      password: cryptedEmail,
      salt: salt.toString('base64'),
      nickname: userData.name,
      token: authToken,
      screenId: generatedId,
      displayLanguage: userLang,
      profile: userData.profile,
      snsId: userData.uid,
      snsType,
      isConfirmed: true,
    });
  }

  if (result.deactivatedAt != null) {
    return next(createError(404, '탈퇴한 계정입니다.'));
  }

  const token = jwt.sign(
    {
      nick: result.nickname,
      uid: result._id,
      isConfirmed: result.isConfirmed,
    },
    SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
  res.cookie('access_token', token, {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'test' ? false : true,
    domain: process.env.NODE_ENV === 'test' ? 'localhost' : '.epiclogue.com',
  });
  console.log(`[INFO] SNS유저 ${result._id} 가 로그인했습니다.`);
  return res.status(200).json({
    result: 'ok',
    nick: result.nickname,
    screenId: result.screenId,
    displayLanguage: result.displayLanguage,
  });
};

/**
 * @description 로그인
 * @access POST /auth/login
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 로그인 정보 및 토큰
 */
export const login = async function (req, res, next) {
  const { email, userPw } = req.body;

  const loginValidationSchema = Joi.object({
    email: Joi.string()
      .regex(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i)
      .required(),
    userPw: Joi.string().required(),
  });

  try {
    try {
      // user input validation
      await loginValidationSchema.validateAsync({ email, userPw });
    } catch (e) {
      console.log(
        `[INFO] ${
          req.headers['x-forwarded-for'] || req.connection.remoteAddress
        } 에서 적절하지 않은 로그인 데이터를 입력했습니다: email: ${email}, password: ${userPw}`
      );
      return next(createError(400, '적절하지 않은 값을 입력했습니다.'));
    }

    const user = await User.getSalt(email);

    if (user) {
      const cryptedPass = crypto.pbkdf2Sync(
        userPw,
        user.salt,
        parseInt(process.env.EXEC_NUM, 10),
        parseInt(process.env.RESULT_LENGTH, 10),
        'sha512'
      );

      const result = await User.findUser(email, cryptedPass.toString('base64'));

      if (result) {
        if (result.deactivatedAt != null) {
          return next(createError(404, '탈퇴한 계정입니다.'));
        }

        const token = jwt.sign(
          {
            nick: result.nickname,
            uid: result._id,
            isConfirmed: result.isConfirmed,
          },
          SECRET_KEY,
          {
            expiresIn: process.env.JWT_EXPIRES_IN,
          }
        );
        res.cookie('access_token', token, {
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'test' ? false : true,
          domain: process.env.NODE_ENV === 'test' ? 'localhost' : '.epiclogue.com',
        });
        console.log(`[INFO] 유저 ${result._id} 가 로그인했습니다.`);
        return res.status(200).json({
          result: 'ok',
          nick: result.nickname,
          screenId: result.screenId,
          displayLanguage: result.displayLanguage,
        });
      }
      console.log(`[INFO] 유저 ${email} 가 다른 비밀번호 ${userPw} 로 로그인을 시도했습니다.`);
      return next(createError(400, '잘못된 비밀번호입니다.'));
    }
    console.log(`[INFO] 존재하지 않는 유저 ${email} 가 로그인을 시도했습니다.`);
    return next(createError(404, '존재하지 않는 유저입니다.'));
  } catch (e) {
    console.log(`[Error] 알 수 없는 오류가 발생했습니다. ${e}`);
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'));
  }
};

/**
 * @description 회원가입
 * @access POST /auth/join
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const join = async function (req, res, next) {
  const { email, userPw, userPwRe, userLang, userNick: nick } = req.body;
  const check = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(userPw);

  const joinValidationSchema = Joi.object({
    email: Joi.string()
      .regex(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i)
      .required(),
    userPw: Joi.string().required(),
    userPwRe: Joi.string().required(),
    nick: Joi.string().trim().required(),
    userLang: Joi.number().required(),
  });

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
      });
    } catch (e) {
      console.log(`[INFO] 유저 ${email} 가 적절하지 않은 데이터로 가입하려 했습니다. ${e}`);
      return next(createError(400, '적절하지 않은 값을 입력했습니다.'));
    }

    if (check) {
      if (userPw === userPwRe) {
        /* 중복 가입 이메일 처리 */
        if ((await User.isExist(email)) != null) {
          console.log(`[INFO] 중복된 이메일 ${email} 로 가입하려했습니다.`);
          return next(createError(400, '중복된 이메일입니다. 다른 이메일로 가입해주세요.'));
        }

        const generatedId = crypto.createHash('sha256').update(email).digest('hex').slice(0, 14);
        const salt = await randomBytesPromise(64);
        const cryptedPass = crypto.pbkdf2Sync(
          userPw,
          salt.toString('base64'),
          parseInt(process.env.EXEC_NUM, 10),
          parseInt(process.env.RESULT_LENGTH, 10),
          'sha512'
        );
        const authToken = cryptedPass.toString('hex').slice(0, 24);
        const result = await User.create({
          email,
          password: cryptedPass.toString('base64'),
          salt: salt.toString('base64'),
          nickname: nick,
          token: authToken,
          screenId: generatedId,
          displayLanguage: userLang,
        });

        if (result) {
          const option = {
            from: process.env.MAIL_USER,
            to: email,
            subject: '이메일 인증을 완료해주세요.',
            html: emailText(email, authToken),
          };
          transporter.sendMail(option, (error, info) => {
            if (error) {
              console.error(
                `[ERROR] ${email} 에게 메일을 보내는 도중 문제가 발생했습니다. ${error}`
              );
              return next(createError(500, '알 수 없는 오류가 발생했습니다.'));
            }
            console.log(`[INFO] ${email} 에게 성공적으로 메일을 보냈습니다: ${info.response}`);
            return res.status(201).json({
              result: 'ok',
              info: info.response,
            });
          });
        } else {
          console.log(`[INFO] 이미 존재하는 이메일 ${email} 로 회원가입을 시도했습니다.`);
          return next(createError(400, '이미 존재하는 아이디입니다. 확인 후 시도해주세요.'));
        }
      } else {
        console.log('[INFO] 일치하지 않는 패스워드로 가입하려했습니다.');
        return next(createError(400, '비밀번호가 일치하지 않습니다.'));
      }
    } else {
      console.log('[INFO] 회원가입 비밀번호 규칙이 맞지 않습니다.');
      return next(createError(400, '비밀번호 규칙을 다시 확인해주세요.'));
    }
  } catch (e) {
    console.error(`[ERROR] 알 수 없는 에러가 발생했습니다. ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};

/**
 * @description 비밀번호 찾기를 위해 메일 전송
 * @access POST /auth/findPass
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const mailToFindPass = async (req, res, next) => {
  const { email } = req.body;
  const userToken = await (await randomBytesPromise(24)).toString('hex');
  const option = {
    from: process.env.MAIL_USER,
    to: email,
    subject: '비밀번호 재설정을 위해 이메일 인증을 완료해주세요.',
    html: findPassText(email, userToken),
  };

  try {
    await User.updateOne({ email }, { $set: { token: userToken } });
    await transporter.sendMail(option);
    console.log(`[INFO] ${email} 에게 성공적으로 메일을 보냈습니다`);
    return res.status(201).json({
      result: 'ok',
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(e));
  }
};

/**
 * @description 유저 비밀번호 변경
 * @access PATCH /auth/findPass
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const findPass = async (req, res, next) => {
  const { email, userPwNew, userPwNewRe, token } = req.body;
  const changePassSchema = Joi.object({
    userPwNew: Joi.string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/)
      .required(),
    userPwNewRe: Joi.string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/)
      .required(),
  });

  /* Check password validation */
  try {
    await changePassSchema.validateAsync({ userPwNew, userPwNewRe });
  } catch (e) {
    console.log(`[INFO] 유저 ${email} 의 비밀번호 변경 실패: ${e}`);
    return next(createError(400, '비밀번호 규칙을 확인해주세요.'));
  }

  try {
    if (userPwNew === userPwNewRe) {
      const authUser = await User.findOne({ email, token });
      if (authUser) {
        const newSalt = await (await randomBytesPromise(64)).toString('base64');
        const newPass = await (
          await crypto.pbkdf2Sync(
            userPwNew,
            newSalt.toString('base64'),
            parseInt(process.env.EXEC_NUM, 10),
            parseInt(process.env.RESULT_LENGTH, 10),
            'sha512'
          )
        ).toString('base64');

        await User.updateOne({ email }, { salt: newSalt, password: newPass });

        console.log(`[INFO] 유저 ${email} 가 비밀번호 변경에 성공했습니다.`);
        return res.status(200).json({
          result: 'ok',
          message: '새로운 비밀번호로 로그인해주세요.',
        });
      }
      console.log(
        `[INFO] 유저 ${email} 가 잘못된 토큰 ${token} 으로 비밀번호 변경을 시도했습니다.`
      );
      return next(createError(401, '적절하지 않은 인증입니다.'));
    }
    console.log(
      `[INFO] 유저 ${email} 서로 다른 비밀번호 ${userPwNew}, ${userPwNewRe} 로 비밀번호 변경을 시도했습니다.`
    );
    return next(createError(400, '비밀번호가 다릅니다.'));
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError('알 수 없는 에러가 발생했습니다.'));
  }
};

/**
 * @description 유저의 메일 인증
 * @access PATCH /auth/mailAuth
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const mailAuth = async function (req, res, next) {
  const { email, token } = req.query;

  try {
    const result = await User.isConfirmed(email, token);
    if (result) {
      await User.confirmUser(email);
      console.log(`[INFO] 유저 ${email} 의 이메일 인증이 완료되었습니다.`);
      return res.status(200).json({
        result: 'ok',
      });
    }
    console.log(`[INFO] 이메일 ${email} 의 이메일 인증이 실패했습니다.`);
    return next(createError(401, '이메일 인증에 실패했습니다.'));
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};
