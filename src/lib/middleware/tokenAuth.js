import dotenv from 'dotenv';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

dotenv.config();

// 예외 페이지들에 대한 route stack의 마지막 async function의 이름을 저장합니다.
const authExceptions = [
  'getBoards', // 메인 페이지
  'viewBoard', // 뷰어 페이지
  'getReplys', // 대댓글 페이지
  'search', // 검색 페이지
  'getMyboard', // 마이보드 페이지
  'bookmarks',
  'secondaryWorks',
  'originals',
  'allWorks', // 마이보드 페이지 끝
  'getReplys', // 대댓글 확인
];

const { SECRET_KEY } = process.env;

/**
 * @description JWT토큰으로 유저 인증 수행
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS middleware
 */
export const verifyToken = async (req, res, next) => {
  try {
    const clientToken = req.headers['x-access-token'];
    const { name: accessPath } = req.route.stack[req.route.stack.length - 1];

    if (!clientToken && authExceptions.includes(accessPath)) {
      // 비회원에게 접근이 허용된 페이지
      return next();
    }

    /* 나머지 기능들에 대해 요청받은 토큰을 검사
        비회원에게 접근이 허용된 페이지의 경우에는 유저의 로그인 상태에 따라 다르게 보이기 위해 필요
    */

    const tokenSchema = Joi.object({
      token: Joi.string()
        .regex(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
        .required(),
    });

    try {
      await tokenSchema.validateAsync({ token: clientToken });
    } catch (e) {
      console.log(
        `[INFO] 인증 실패: 유저의 토큰이 누락되었거나 적절하지 않습니다. ip: ${
          req.headers['x-forwarded-for'] || req.connection.remoteAddress
        } token: ${clientToken}`
      );
      return next(createError(401, '인증 실패: 적절하지 않은 인증입니다.'));
    }

    let decoded;

    try {
      decoded = await jwt.verify(clientToken, SECRET_KEY);
    } catch (e) {
      console.log(
        `[INFO] 인증 실패: 손상된 토큰을 사용하였습니다. ip: ${
          req.headers['x-forwarded-for'] || req.connection.remoteAddress
        } token: ${clientToken}`
      );
      return next(createError(401, '인증 실패: 적절하지 않은 인증입니다.'));
    }

    if (decoded) {
      if (decoded.isConfirmed) {
        res.locals.uid = decoded.uid;
        next();
      } else {
        console.log(
          `[INFO] 인증 실패: 유저 ${decoded.uid} 가 로그인을 시도했으나 이메일 인증이 완료되지 않았습니다.`
        );
        return next(createError(401, '이메일 인증이 완료되지 않았습니다.'));
      }
    } else {
      console.log(
        `[INFO] 인증 실패: 유저 ${
          req.headers['x-forwarded-for'] || req.connection.remoteAddress
        } 가 로그인을 시도했으나 토큰의 유효기간이 만료되었거나 토큰이 없습니다.`
      );
      return next(createError(401, '인증 실패: 적절하지 않은 인증입니다.'));
    }
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};
