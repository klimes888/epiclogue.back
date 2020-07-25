const express = require("express");
const router = express.Router();
const { verifyToken, checkWriter, lagacyCheckWriter } = require("./authorization");
require("dotenv").config();
const Board = require("../models/board");
const Reply = require('../models/reply');
const User = require('../models/users');
const upload = require('./multer');

router.get('/posting', (req, res) => {
  res.status(200).json({
    msg: "Server is on work"
  })
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
  const language = req.body.language;
  const result = await Board.create({
    uid,
    boardTitle,
    boardBody,
    boardImg,
    category,
    pub,
    language,
    likeCount: 0
  });
  console.log(`Posting result: ${result}`)
  if (result) {
    res.status(201).json({
      result: 'ok',
      data: result
    })
  } else {
    // 서버, DB, 요청 데이터 이상 등 에러 상세화 필요
    res.status(401).json({
      result: 'error'
    })
  }
});
// 글 뷰
router.get("/view/:boardId", verifyToken, async (req, res, next) => {
  const boardId = req.params.boardId;
  const boardData = await Board.getArticle(boardId);
  const writerData = await User.getUserInfo(res.locals.uid, {
    nickname: 1,
    userid: 1
  })
  const replyDataWithOutUserInfo = await Reply.getRepliesByBoardId(boardId);
  const replyData = []
  for(const reply of replyDataWithOutUserInfo) {
    let {nickname, userid} = await User.getUserInfo(reply.uid);
    replyData.push({
      _id:reply._id,
      buid:reply.buid,
      edited:reply.edited,
      replyBody:reply.replyBody,
      writeDate:reply.writeDate,
      userInfo:{
        userId:userid,
        userNick:nickname
      }
    })
  }
  res.status(200).json({
    result: 'ok',
    writer: writerData,
    board: boardData,
    reply: replyData
  });
})
// 삭제
router.get("/view/:boardId/delete", verifyToken, lagacyCheckWriter, async function (req, res, next) {
  const boardId = req.params.boardId;
  await Board.removeArticle(boardId, (err, data) => {
    if (err) {
      res.status(400).json({
        result: "error",
        reason: err,
      });
    } else {
      res.status(200).json({
        result: "ok",
      });
      return;
    }
  });
});
// 수정 전 이전 데이터 불러오기
router.get('/view/:boardId/edit', verifyToken, lagacyCheckWriter, async function (req, res, next) {
  const boardId = req.params.boardId;
  const result = await Board.getArticle(boardId);
  // console.log(result)

  res.status(201).json({
    result:'ok',
    data: result
  })
})
// 수정
router.post(
  "/view/:boardId/edit",
  verifyToken,
  upload.any(),
  lagacyCheckWriter,
  function (req, res, next) {
    let boardImg = [];
    for (let i = 0; i < req.files.length; i++) {
      boardImg.push(req.files[i].location);
    }
    const updateData = {
      uid: res.locals.uid,
      boardId: req.params.boardId,
      boardTitle: req.body.boardTitle,
      boardBody: req.body.boardBody,
      boardImg: req.body.boardImg,
      category: req.body.category,
      pub: req.body.pub,
      language: req.body.language,
    };

    Board.updateArticle(updateData, (err, data) => {
      if (err) {
        res.status(400).json({
          msg: err,
        });
      }
      /* S3 업로드 코드 필요 */
      res.sendStatus(200);
      return;
    });
  }
);

// 댓글 생성
router.post("/view/:buid/reply", verifyToken, async function (req, res, next) {
  const replyData = {
    uid: res.locals.uid,
    replyBody: req.body.replyBody,
    buid: req.params.buid,
  };

  await Reply.create(replyData, (err, data) => {
    console.log(data);
    if (err) {
      res.status(400).json({
        msg: err,
      });
    } else {
      res.sendStatus(201);
    }
  });

  /*
   댓글과 원문 상태에 따라 추가적인 에러핸들링 필요
    1. 원문 삭제
    2. 서버 오류
    3. DB 오류
    4. 클라이언트 통신 불가
     */
});

// 댓글 수정
router.post("/view/:buid/updateReply", verifyToken, lagacyCheckWriter, async function (req, res, next) {
  const newReplyData = {
    replyId : req.body.replyId,
    newReplyBody: req.body.replyBody
  }

  await Reply.update(newReplyData, (err, data) => {
    if (err) {
      res.status(400).json({
        msg: err
      })
    } else {
      res.sendStatus(200)
    }
  })
});

// 댓글 삭제
router.post("/view/:buid/removeReply", verifyToken, lagacyCheckWriter, async function (req, res, next) {
  const replyId = req.body.replyId;
  await Reply.delete(replyId, (err, data) => {
    console.log(data);
    if (err) {
      res.status(400).json({
        msg: err
      })
    } else {
      res.sendStatus(200);
    }
  })
});

/* 유저마다 다르게 받아야 함 */
router.get("/postlist", verifyToken, async function (req, res, next) {
  const boardList = await Board.findAll();
  const result = new Array();
  for(const data of boardList) {
    let userInfo = await User.getUserInfo(data.uid);
    result.push({
      boardUid:data._id,
      thumbPath:data.boardImg[0],
      userNick: userInfo.nickname,
      pub:data.pub,
      category:data.category
    });
  }
  if(result) {
    res.status(201).json({
      result:'ok',
      data: result
    });
  } else {
    res.status(401).json({
      result:'error',
      reason: 'something is wrong'
    })
  }
});

module.exports = router;
