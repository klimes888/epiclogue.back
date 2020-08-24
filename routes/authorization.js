require("dotenv").config();

const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
const Board = require("../models/board");
const Feedback = require("../models/feedback");
const Reply = require("../models/reply");

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

// 작성자에 대한 인증 미들웨어
const checkWriter = async (req, res, next) => {
  let isWriter = true;
  let type;
  let id;

  try {
    if (req.params.replyId !== undefined) {
      type = "댓글";
      id = req.params.replyId;
      isWriter = await Reply.isWriter(res.locals.uid, req.params.replyId);
    } else if (req.params.feedbackId !== undefined) {
      type = "피드백";
      id = req.params.feedbackId;
      isWriter = await Feedback.isWriter(res.locals.uid, req.params.feedbackId);
    } else if (req.params.boardId !== undefined) {
      type = "글";
      id = req.params.boardId;
      isWriter = await Board.isWriter(res.locals.uid, req.params.boardId);
    }

    if (isWriter !== null) {
      console.log(`[Log] Writer auth passed`);
      next();
    } else {
      console.log(
        `[Auth error] user: ${res.locals.uid}, type: ${type}, id: ${id}`
      );
      return res.status(401).json({
        result: "error",
        message: `${type} 작성자가 아닙니다.`,
      });
    }
  } catch (e) {
    console.error(`[Error!] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};

module.exports = {
  verifyToken,
  checkWriter,
};
