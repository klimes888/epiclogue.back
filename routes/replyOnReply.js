import express from "express";
const router = express.Router();

import { verifyToken, checkWriter } from "./authorization";
import ReplyOnReply from "../models/replyOnReply";

// 대댓글 생성
router.post("/", verifyToken, (req, res, next) => {
  const userId = res.locals.uid;
  const parentId = req.body.parentId;
  const boardId = req.body.boardId;
  const replyBody = req.body.replyBody;

   ReplyOnReply.create({ userId, parentId, replyBody, boardId }, (err, data) => {
    console.log(data)
    if (err) {
      console.log(`[Error!] ${err}`)
      res.status(400).json({
        msg: err.message,
      });
      return;
    } else {
      res.sendStatus(200);
      return;
    }
  });
});

// 댓글 하위의 대댓글 뷰
router.get("/:parentId", verifyToken, async (req, res, next) => {
  const parentId = req.params.parentId;
  ReplyOnReply.getByParentId(parentId, (err, data) => {
    if (err) {
      console.log(`[Error!] ${err}`)
      res.status(400).json({
        msg: err.message,
      });
      return;
    } else {
      res.status(200).json({
        data,
      });
    }
  });
});

router.get("/:repliesOnReplyId/edit", verifyToken, checkWriter, async (req, res, next) => {
  const repliesOnReplyId = req.params.repliesOnReplyId
  await ReplyOnReply.getBody(repliesOnReplyId, (err, data) => {
    if (err) {
      console.log(`[Error!] ${err}`)
      res.status(400).json({
        msg: err.message,
      });
      return;
    }
    console.log(data);
    res.status(200).json(data);
    return;
  })
})

router.patch("/:repliesOnReplyId", verifyToken, checkWriter, async (req, res, next) => {
  const newForm = {
    repliesOnReplyId: req.params.repliesOnReplyId,
    newReplyBody: req.body.newReplyBody,
  };

  await ReplyOnReply.update(newForm, (err, data) => {
    if (err) {
      console.log(`[Error!] ${err}`)
      res.status(400).json({
        msg: err.message,
      });
      return;
    } else {
      console.log(data);
      if (data.ok === 1) {
        if (data.n === 1 && data.n === data.nModified) {
          res.sendStatus(200);
        } else if (data.n === 1 && data.n !== data.nModified) {
          res.status(200).json({
            msg: "질의에 성공했으나 데이터가 수정되지 않았습니다.",
          });
        } else if (data.n === 0) {
          res.status(400).json({
            msg: "존재하지 않는 데이터에 접근했습니다.",
          });
        }
        return;
      } else {
        res.status(400).json({
          msg: `데이터베이스 질의 실패; ${data.ok}`,
        });
        return;
      }
    }
  });
});

router.delete("/:repliesOnReplyId", verifyToken, checkWriter, async (req, res, next) => {
  const repliesOnReplyId = req.params.repliesOnReplyId;

  ReplyOnReply.delete(repliesOnReplyId, (err, data) => {
    if (err) {
      console.log(`[Error!] ${err}`)
      if (msg.kind === "ObjectID") {
        res.sendStatus(404);
      } else {
      res.status(400).json({
        msg: err.message,
      });
      }
      return;
    }
    console.log(data);

    if (data.ok === 1) {
      if (data.n === 1 && data.n === data.deletedCount) {
        res.sendStatus(200);
      } else if (data.ok === 1 && data.n !== data.deletedCount) {
        res.status(200).json({
          msg: "질의에 성공했으나 데이터가 삭제되지 않았습니다.",
        });
      } else if (data.n === 0) {
        res.status(400).json({
          msg: "존재하지 않는 데이터에 접근했습니다.",
        });
      }
      return;
    } else if (data.ok === 0) {
      res.status(400).json({
        msg: "데이터베이스 질의 실패",
      });
    }
    return;
  });
});

router.delete(
  "/:replyId",
  verifyToken,
  async (req, res, next) => {
    const replyId = req.params.replyId;

    await ReplyOnReply.deleteByParentId(replyId, (err, data) => {
      if (err) {
        console.log(`[Error!] ${err}`) 
        if (msg.kind === "ObjectID") {
          res.sendStatus(404);
        } else {
      res.status(400).json({
        msg: err.message,
      });
        }
        return;
      }

      if (data.ok === 1) {
        if (data.n === 1 && data.n === data.deletedCount) {
          res.sendStatus(200);
        } else if (data.ok === 1 && data.n !== data.deletedCount) {
          res.status(200).json({
            msg: "질의에 성공했으나 데이터가 삭제되지 않았습니다.",
          });
        } else if (data.n === 0) {
          res.status(400).json({
            msg: "존재하지 않는 데이터에 접근했습니다.",
          });
        }
        return;
      } else if (data.ok === 0) {
        res.status(400).json({
          msg: "데이터베이스 질의 실패",
        });
      }
      return;
    });
  }
);

// 글 삭제시 모든 댓글 및 대댓글 삭제 쿼리 필요

module.exports = router;
