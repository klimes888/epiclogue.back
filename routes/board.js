const express = require("express");
const router = express.Router();
const { verifyToken } = require("./authorization");
require("dotenv").config();
const Board = require("../models/board");
const upload = require('./multer')

/* 투고 */
router.post("/posting", verifyToken, upload.any(), async function (req, res, next) {
  const uid = res.locals.uid;
  const boardTitle = req.body.boardTitle;
  const boardBody = req.body.boardBody;
  const boardImg = req.body.boardImg;
  const category = req.body.category;
  const pub = req.body.pub;
  const writeDate = req.body.writeDate;
  const language = req.body.language;

  for (let i = 0; i < req.file.length; i++) {
    console.log(`이미지 ${i} 경로 : ${req.files[i].boardImg}`);
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
    boardImg: req.body.boardImg,
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

router.post("/translate", verifyToken, async function (req, res, next) {

});

router.post("/comment", verifyToken, async function (req, res, next) {

});

router.get("/postlist", verifyToken, async function (req, res, next) {
  
});

module.exports = router;
