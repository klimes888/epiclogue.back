import crypto from 'crypto';
import util from 'util';
import dotenv from 'dotenv';
import Joi from 'joi';
import createError from 'http-errors';
import { startSession } from 'mongoose';
import { deleteImage } from '../../lib/imageCtrl';
import { User } from '../../models';

const randomBytesPromise = util.promisify(crypto.randomBytes);
// const crypto.pbkdf2Sync = util.promisify(crypto.pbkdf2)

dotenv.config();

/* GET users listing. */
export const getUserEditInfo = async function (req, res, next) {
  const { uid } = res.locals;
  try {
    const result = await User.getUserInfo(uid, {
      nickname: 1,
      intro: 1,
      country: 1,
      screenId: 1,
      banner: 1,
      profile: 1,
      email: 1,
    });

    return res.status(200).json({
      result: 'ok',
      data: result,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: 'error',
      message: e.message,
    });
  }
};

export const postUserEditInfo = async function (req, res, next) {
  // remove old images
  const originalData = await User.getUserInfo(res.locals.uid);
  const originalImages = [originalData.banner, originalData.profile];
  const screenId = req.body.screenId || originalData.screenId;
  const nickname = req.body.userNick || originalData.nickname;
  const country = parseInt(req.body.userCountry) || originalData.country;
  const availableLanguage = req.body.userLang || originalData.availableLanguage;
  const intro = req.body.userIntro || originalData.intro;
  let banner;
  let profile;
  console.log(originalImages);
  if (req.files !== undefined && req.files.length !== 0) {
    if (req.files.length > 1) {
      if (req.files[0].fieldname == 'banner') {
        banner = req.files[0].location;
        profile = req.files[1].location;
      } else {
        banner = req.files[1].location;
        profile = req.files[0].location;
      }
      deleteImage(originalImages);
    } else if (req.files.length == 1) {
      if (req.files[0].fieldname == 'banner') {
        banner = req.files[0].location;
        profile = originalImages[1];
        if (originalImages[0] !== null) deleteImage(originalImages[0]);
      } else {
        profile = req.files[0].location;
        banner = originalImages[0];
        if (originalImages[1] !== null) deleteImage(originalImages[1]);
      }
    }
  } else {
    banner = originalData.banner;
    profile = originalData.profile;
  }

  const session = await startSession();

  try {
    await session.withTransaction(async () => {
      const checkIdUnique = await User.isScreenIdUnique(screenId, session);
      if (checkIdUnique || screenId === originalData.screenId) {
        const newerUserData = {
          userId: res.locals.uid,
          screenId,
          nickname,
          availableLanguage,
          country,
          intro,
          banner,
          profile,
        };

        await User.updateProfile(newerUserData, session);

        console.log(`[INGO] 유저 ${res.locals.uid}가 프로필을 수정했습니다.`);
        return res.status(200).json({
          result: 'ok',
          data: newerUserData,
        });
      }
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 프로필 변경에 실패했습니다: 중복된 screenId를 입력했습니다.`,
      );
      return next(createError(400, '중복된 screenId 입니다.'));
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  } finally {
    session.endSession();
  }
};

export const changePass = async function (req, res, next) {
  const { uid } = res.locals;
  const { userPw } = req.body;
  const { userPwNew } = req.body;
  const { userPwNewRe } = req.body;

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
    });

    await changePassSchema.validateAsync({ userPw, userPwNew, userPwNewRe });
  } catch (e) {
    console.log(`[INFO] 유저 ${res.locals.uid} 의 비밀번호 변경 실패: ${e}`);
    return next(createError(400, '비밀번호 규칙을 확인해주세요.'));
  }

  const session = await startSession();

  if (userPw !== userPwNew) {
    if (userPwNew === userPwNewRe) {
      try {
        await session.withTransaction(async () => {
          const originalUserData = await User.getUserInfo(uid).session(session);
          const saltNew = await randomBytesPromise(64);
          const crypt_Pw = await crypto.pbkdf2Sync(
            userPw,
            originalUserData.salt,
            parseInt(process.env.EXEC_NUM),
            parseInt(process.env.RESULT_LENGTH),
            'sha512',
          );
          const crypt_PwNew = await crypto.pbkdf2Sync(
            userPwNew,
            saltNew.toString('base64'),
            parseInt(process.env.EXEC_NUM),
            parseInt(process.env.RESULT_LENGTH),
            'sha512',
          );

          const changeResult = await User.changePass(
            uid,
            crypt_Pw.toString('base64'),
            crypt_PwNew.toString('base64'),
            saltNew.toString('base64'),
            session,
          );

          if (changeResult.nModified == 1) {
            console.log(`[INFO] 유저 ${res.locals.uid} 가 비밀번호를 변경했습니다.`);
            return res.status(200).json({
              result: 'ok',
              message: '비밀번호 변경 완료',
            });
          } if (changeResult.nModified != 1) {
            console.error(
              `[ERROR] 유저 ${res.locals.uid} 의 비밀번호 변경이 실패했습니다: 데이터베이스 질의에 실패했습니다.`,
            );
            return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
          }
        });
      } catch (e) {
        console.error(`[Error] ${e}`);
        return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
      } finally {
        session.endSession();
      }
    } else {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 의 비밀번호 변경이 실패했습니다: 새로운 비밀번호 미일치`,
      );
      return next(createError(400, '비밀번호과 재입력이 다릅니다.'));
    }
  } else {
    console.log(
      `[INFO] 유저 ${res.locals.uid} 의 비밀번호 변경이 실패했습니다: 기존 비밀번호와 동일`,
    );
    return next(createError(400, '기존 비밀번호과 같은 비밀번호는 사용할 수 없습니다.'));
  }
};

export const deleteUser = async function (req, res, next) {
  const { uid } = res.locals;
  const { userPw } = req.body;

  const deleteSchema = Joi.object({
    userPw: Joi.string().trim().required(),
  });

  try {
    await deleteSchema.validateAsync({ userPw });
  } catch (e) {
    console.log(`[INFO] 유저 ${uid} 가 탈퇴에 실패했습니다: 비밀번호 미입력`);
    return next(createError(400, '비밀번호를 입력해주세요.'));
  }

  const session = await startSession();

  try {
    await session.withTransaction(async () => {
      const info = await User.getUserInfo(uid).session(session);
      const crypt_Pw = await crypto.pbkdf2Sync(
        userPw,
        info.salt,
        parseInt(process.env.EXEC_NUM),
        parseInt(process.env.RESULT_LENGTH),
        'sha512',
      );

      // remove old images
      const originalData = await User.getUserInfo(res.locals.uid);
      const originalImages = [originalData.banner, originalData.profile];
      // console.log(originalImages)
      deleteImage(originalImages);

      const deletion = await User.deleteUser(uid, crypt_Pw.toString('base64')).session(session);

      if (deletion.ok === 1) {
        if (deletion.nModified === 1) {
          console.log(`[INFO] 유저 ${res.locals.uid} 가 탈퇴했습니다.`);
          return res.status(200).json({
            result: 'ok',
          });
        }
        console.log(`[INFO] 유저 ${res.locals.uid} 가 탈퇴에 실패했습니다: 비밀번호가 다릅니다.`);
        return next(createError(400, '비밀번호를 확인해주세요.'));
      }
      console.error(
        `[ERROR] 유저 ${res.locals.uid} 가 탈퇴에 실패했습니다: 데이터베이스 질의에 실패했습니다.`,
      );
      return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  } finally {
    session.endSession();
  }
};
