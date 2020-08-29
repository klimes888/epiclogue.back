import dotenv from 'dotenv'

import jwt from "jsonwebtoken";

dotenv.config()

const SECRET_KEY = process.env.SECRET_KEY;

// JWT 기반 유저 인증 미들웨어
const verifyToken = (req, res, next) => {
  try {
    const clientToken = req.headers["x-access-token"];
    const decoded = jwt.verify(clientToken, SECRET_KEY);
    if (decoded) {
      if (decoded.isConfirmed) {
        res.locals.uid = decoded.uid;
        next();
      } else {
        return res.status(401).json({
          result: "error",
          message: "이메일 인증이 완료되지 않았습니다!",
        });
      }
    } else {
      return res.status(401).json({
        result: "error",
        message: "token 유효기간 만료 또는 토큰이 전송되지 않았습니다.",
      });
    }
  } catch (e) {
    console.error(`[Error!] ${e}`);
    return res.status(500).json({
      result: "error",
      message: "token 유효기간 만료 또는 토큰이 전송되지 않았습니다.",
    });
  }
};

module.exports = {
  verifyToken,
};
