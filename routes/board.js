const express = require("express");
const router = express.Router();
const { verifyToken } = require("./authorization");
require("dotenv").config();
const Board = require("../models/board");
const Reply = require('../models/reply');
const upload = require('./multer');

router.get('/posting', (req, res) => {
  res.send('Server is on');
})

router.post("/posting", verifyToken, upload.any(), async function (req, res, next) {
  const uid = res.locals.uid;
  const boardTitle = req.body.boardTitle;
  const boardBody = req.body.boardBody;
  let boardImg = [];
  for (let i = 0; i < req.files.length; i++) {
    boardImg.push(req.files[i].location);
  }
  const category = req.body.category;
  const pub = req.body.pub;
  const writeDate = req.body.writeDate;
  const language = req.body.language;

  for (let i = 0; i < req.file.length; i++) {
    console.log(`이미지 ${i} 경로 : ${req.files[i].location}`);
  }

  const result = await Board.create({
    uid,
    boardTitle,
    boardBody,
    boardImg,
    category,
    pub,
    writeDate,
    language,
    likeCount: 0
  });

  if (result) {
    res.status(201).json({
      result: 'ok'
    })
  } else {
    // 서버, DB, 요청 데이터 이상 등 에러 상세화 필요
    res.status(401).json({
      result: 'error'
    })
  }
});

router.post("/editBoard", verifyToken, async function (req, res, next) {
  const updateData = {
    boardTitle: req.body.boardTitle,
    boardBody: req.body.boardBody,
    boardImg: req.files.boardImg,
    category: req.body.category,
    pub: req.body.pub,
    writeDate: req.body.writeDate,
    language: req.body.language
  }  

  const result = await Board.updateArticle(res.locals.uid, updateData);
  
  if (result) {
    res.status(201).json({
      result: 'ok'
    });
  } else {
    // 서버, DB, 요청 데이터 이상 등 에러 상세화 필요
    res.status(401).json({
      result: 'error'
    })
  }
});

/* API 미정의 */
router.post("/translate", verifyToken, async function (req, res, next) {
  
});

router.post("/comment", verifyToken, async function (req, res, next) {
  const commentData = {
    replyBody: req.body.replyBody,
    boardUid: req.body.boardUid,
    replyWriteDate: Date.now
  }

  const result = Reply.create(commentData);
  if (result) {
    res.status(201).json({
      result: 'ok'
    })
  } else {
    /* 댓글 상황에 따라 다르게 처리
    1. 원문 삭제
    2. 서버 오류
    3. DB 오류
    4. 클라이언트 통신 불가
     */
    res.status(401).json({
      result: 'error',
      reason: '코드 재작성 필요'
    })
  }
  
});

/* 유저마다 다르게 받아야 함 */
router.get("/postlist", verifyToken, async function (req, res, next) {
  const illust = req.body.illust;
  const comic = req.body.comic;
  Board.find({}, { pub: true, illust, comic })
});



module.exports = router;
