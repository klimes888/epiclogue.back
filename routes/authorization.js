const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const User = require('../models/users');
const Board = require('../models/board');
const Reply = require('../models/reply');

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
// 1. 글 수정, 삭제 및 댓글 수정 삭제에 대한 작성자 인증
// 2. 프로필 수정 진입 및 완료 쿼리시 사용자 인증
const checkAuth = async (req, res, next) => {
  try {
    let isWriter = false;
    console.log (req.body.replyId ? true : false);
    if (req.body.replyId ? true : false) { // Reply auth
      isWriter = await Reply.isWriter(res.locals.uid, req.body.replyId) ? true : false;
      console.log(`[LOG] reply auth: ${isWriter}`)
    } else { // Board auth
      isWriter = await Board.isWriter(res.locals.uid, req.params.buid) ? true : false;
      console.log(`[LOG] board auth: ${isWriter}`)
    }
    if (isWriter) {
      next();
    } else {
      res.status(400).json({
        result: 'error',
        reason: '허가되지 않은 사용자입니다.'
      })
    }
  } catch (err) {
    res.status(400).json({
      result: 'error',
      reason: '허가되지 않은 사용자입니다.'
    })
  }
}

exports.verifyToken = verifyToken;
exports.checkAuth = checkAuth;