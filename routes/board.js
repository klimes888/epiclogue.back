const express = require("express");
const router = express.Router();
const { verifyToken } = require("./authorization");
require("dotenv").config();
const Board = require("../models/board");
const multer = require("multer");

/* 투고 */
router.post("/posting", verifyToken, async function (req, res, next) {
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
    boardTitle,
    boardBody,
    boardImg,
    category,
    pub,
    writeDate,
    language
  });

  if (result) {
    res.status(201).json({
      result: 'ok',
      // 메인으로 리다이렉트
    })
  }

});

router.post("/editBoard", verifyToken, async function (req, res, next) {

});

router.post("/translate", verifyToken, async function (req, res, next) {

});

router.post("/comment", verifyToken, async function (req, res, next) {

});

router.get("/postlist", verifyToken, async function (req, res, next) {

});

module.exports = router;
