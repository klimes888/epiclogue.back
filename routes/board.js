const express = require("express");
const router = express.Router();
const { verifyToken } = require("./authorization");
require("dotenv").config();
const Board = require("../models/board");
const Reply = require('../models/reply');
const User = require('../models/users');
const upload = require('./multer');
const ReplyOnReply = require("../models/replyOnReply");

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

router.get('/deleteBoard/:buid', verifyToken, async function(req, res, next) {
  const buid = req.params.buid;
  const uid = res.locals.uid;

  const isWriter = await Board.isWriter(uid, buid);
  console.log('[LOG] Writer check: ' + isWriter);
  if (isWriter) {
    await Board.removeArticle(buid, (err, data) => {
      if(err) {
        res.status(503).json({
          result: 'error',
          reason: err
        })
      } else {
        res.status(200).json({
          result: 'ok'
        })
      }
    });
    res.status(201).json({
      result:'ok'
    })
  } else {
    res.status(400).json({
      result: 'error',
      reason: '작성자만 삭제할 수 있습니다.'
    })
  }
})

router.get('/editBoard/:buid', verifyToken, async function (req, res, next) {
  const buid = req.params.buid;
  const result = await Board.getArticle(buid);
  console.log(result)

  res.status(201).json({
    result:'ok',
    data: result
  })
})

router.post("/editBoard", verifyToken, upload.any(), async function (req, res, next) {
  let boardImg = [];
  for (let i = 0; i < req.files.length; i++) {
    boardImg.push(req.files[i].location);
  }
  const updateData = {
    uid: res.locals.uid,
    boardId: req.body.boardId,
    boardTitle: req.body.boardTitle,
    boardBody: req.body.boardBody,  
    boardImg: boardImg,
    category: req.body.category,
    pub: req.body.pub,
    language: req.body.language
  }

  // 글을 쓴 유저가 맞다면
  if ((await Board.isWriter(updateData.uid, updateData.boardId)) !== null) {
    console.log('isWriter passed')
    const query = await Board.updateArticle(updateData);
    // S3에서 이전 이미지 삭제하는 기능 추가 필요
    console.log('[LOG] Update query result: ' + query)
    res.status(200).json({
      result: 'ok'
    })
    /* 에러 핸들링이 작동하지 않아 리팩토링 할 때 고칠 것 */
    // if (query) {
    //   res.status(201).json({
    //     result: "ok",
    //   });
    // } else {
    //   res.status(401).json({
    //     result: "error",
    //     reason: query,
    //   });
    // }
  } else {
    res.status(400).json({
      result: "error",
      reason: "작성자만 수정할 수 있습니다."
    })
  }
});

/* API 미정의 */
router.post("/translate", verifyToken, async function (req, res, next) {
  
});

router.post("/reply", verifyToken, async function (req, res, next) {
  const replyData = {
    uid: res.locals.uid,
    replyBody: req.body.replyBody,
    buid: req.body.buid
  }
  const result = await Reply.create(replyData);

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

router.post("/updateReply", verifyToken, async function (req, res, next) {
  const uid = res.locals.uid;
  const newReplyBody = req.body.replyBody;
  const replyId = req.body.replyId;

  if ( await Reply.isWriter(uid, replyId) ) {
    const result = await Reply.updateReply(replyId, newReplyBody);
    if (result) {
      res.status(200).json({
        result: "ok",
      });
    } else if (result !== true && result !== false) {
      res.status(400).json({
        result: "error",
        reason: result
      });
    }
  } else {
    res.status(401).json({
      result: "error",
      reason: "작성자만 수정할 수 있습니다.",
    });
  }
});

router.post("/removeReply", verifyToken, async function (req, res, next) {
  const uid = res.locals.uid;
  const replyId = res.body.replyId;

  if (await Board.isWriter(uid, replyId)) {
    const result = await Board.removeReply(replyId);
    if (result) {
      res.status(200).json({
        result: "ok",
      });
    } else {
      res.status(400).json({
        result: "error",
        reason: "댓글 삭제 실패",
      });
    }
  } else {
    res.status(401).json({
      result: "error",
      reason: "작성자만 삭제할 수 있습니다.",
    });
  }
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

router.post("/replyOnReply", verifyToken, async function (req, res, next) {
  const uid = res.locals.uid;
  const replyId = req.body.replyId;
  const replyOnReplyBody = req.body.replyOnReplyBody;

  const result = await ReplyOnReply.create({ uid, replyId, replyOnReplyBody});
  if (result) {
    res.status(201).json({
      result: 'ok'
    })
  } else {
    res.status(401).json({
      result: "error",
      reason: "대댓글 작성 실패"
    })
  }
})

router.post("/updateReplyOnReply", verifyToken, async function (req, res, next) {
  const uid = res.locals.uid;
  const replyOnReplyId = req.body.replyOnReplyId;
  const newReplyOnReplyBody = req.body.replyOnReplyBody;

  if (await ReplyOnReply.isWriter(uid, replyOnReplyId)) {
    const result = await ReplyOnReply.updateReplyOnReply(replyOnReplyId, replyOnReplyBody);
    if (result) {
      res.status(201).json({
        result: 'ok'
      })
    } else {
      res.status(401).json({
        result: "error",
        reason: "대댓글 수정 실패"
      })
    }
  } else {
    res.status(401).json({
      result: "error",
      reason: "작성자만 수정할 수 있습니다."
    })
  }
})

router.post("/removeReplyOnReply", verifyToken, async function (req, res, next) {
  const uid = res.locals.uid;
  const replyOnReplyId = req.body.replyOnReplyId;

  if (await ReplyOnReply.isWriter(uid, replyOnReplyId)) {
    const result = await ReplyOnReply.removeReplyOnReply(replyOnReplyId);
    if (result) {
      res.status(201).json({
        result: 'ok'
      })
    } else {
      res.status(401).json({
        result: "error",
        reason: "대댓글 삭제 실패"
      })
    }
  } else {
    res.status(401).json({
      result: "error",
      reason: "작성자만 삭제할 수 있습니다."
    })
  }
})

router.get("/view/:buid", verifyToken, async (req, res, next) => {
  const buid = req.params.buid;
  let boardData = await Board.getArticle(buid);
  const replyData = await Reply.getRepliesByBoardId(buid);
  boardData.replyList = new Array();
  for (let i = 0; i < replyData.length; i++) {
    (boardData.replyList).push(replyData[i])
  }
  // console.log('Reply: ' + replyData[0]);
  // const replyOnReplyData = await ReplyOnReply.getRepliesByReplyId()
  // console.log(boardData)
  res.status(201).json({
    result: 'ok',
    data: boardData
  });
})

module.exports = router;
