const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const User = require('../models/users');
const Board = require('../models/board');
const Reply = require('../models/reply');
const ReplyOnReply = require('../models/replyOnReply')

const verifyToken = (req, res, next) => {
    try {
        const clientToken = req.headers['x-access-token'];
        const decoded = jwt.verify(clientToken, SECRET_KEY);
        if (decoded) {
          if(decoded.isConfirmed){
            res.locals.uid = decoded.uid;
            next();
          } else {
            res.status(401).json({
              result:'error',
              reason:'이메일 인증이 완료되지 않았습니다!'
            })
          }
        } else {
            res.status(401).json({
              result:'error', 
              reason:'검증 실패'
            });
        }
    } catch (err) {
        res.status(401).json({
          result: 'error',
          reason:'token 유효기간 만료 또는 토큰이 전송되지 않았습니다.'
        });
    }
  };
// 유저 정보에 대한 권한 인증 미들웨어
// 1. 글 수정/삭제 및 댓글과 대댓글 수정/삭제에 대한 작성자 인증
// 2. 프로필 수정 진입 및 완료 쿼리시 사용자 인증
const checkWriter = async (req, res, next) => {
  try {
    let isWriter = true;
    console.log(req.params.repliesOnReplyId)
    console.log(req.params.replyId)
    console.log(req.params.boardId)
    
    if (req.params.repliesOnReplyId !== undefined) {
      await ReplyOnReply.isWriter(res.locals.uid, req.params.repliesOnReplyId, (err, data) => {
        if (err) {
          res.status(401).json({
            access: "reply on reply",
            msg: "허가되지 않은 사용자입니다."
          })
          return;
        }
        isWriter = true
      })
    } else if (req.params.replyId !== undefined) {
      await Reply.isWriter(res.locals.uid, req.params.replyId, (err, data) => {
        if (err) {
          res.status(401).json({
            access: "reply",
            msg: "허가되지 않은 사용자입니다."
          })
          return;
        }
        isWriter = true
      })
    } else if (req.params.boardId !== undefined) {
      await Board.isWriter(res.locals.uid, req.params.boardId, (err, data) => {
        if (err) {
          res.status(401).json({
            access: "post",
            msg: "허가되지 않은 사용자입니다."
          })
          return;
        }
        isWriter = true
      })
    } else {
      res.status(405).json({
        msg: "잘못된 접근입니다."
      })
      return;
    }

    if (isWriter) {
      next();
    } else {
      res.status(401).json({
        result: 'error',
        reason: '허가되지 않은 사용자입니다.'
      })
    }
  } catch (err) {
    res.status(401).json({
      result: 'error',
      reason: '허가되지 않은 사용자입니다.'
    })
  }
}


module.exports = {
  verifyToken,
  checkWriter,
  lagacyCheckWriter
}