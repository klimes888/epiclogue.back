import express from "express";
const router = express.Router();

import { verifyToken, checkWriter } from "./authorization";
import Feedback from "../models/feedback";

/*
  This is reply router.
  Base url: /{screen-id}/posts/{board-id}/replies
*/

router.post("/", verifyToken, async (req, res, next) => {
  const feedbackData = {
    uid: res.locals.uid,
    boardId: req.body.boardId,
    body: req.body.body
  }

  await Feedback.create(feedbackData, (err, data) => {
    if (err) {
      console.log(`[Error!] ${err}`);
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

router.get("/:feedbackId/edit", verifyToken, checkWriter, async (req, res, next) => {
  await Feedback.getBody(req.params.feedbackId, (err, data) => {
    if (err) {
      console.log(`[Error!] ${err}`);
      res.status(400).json({
        msg: err.message,
      });
      return;
    }
    res.status(200).json({
      data
    })
  })
})

router.patch("/:feedbackId", verifyToken, checkWriter, async (req, res, next) => {
  const newForm = {
    feedbackId: req.params.feedbackId,
    newBody: req.body.newBody,
  };

  await Feedback.update(newForm, (err, data) => {
    if (err) {
      console.log(`[Error!] ${err}`);
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

router.delete("/:feedbackId", verifyToken, checkWriter, async (req, res, next) => {
  const feedbackId = req.params.feedbackId;

  await Feedback.delete(feedbackId, (err, data) => {
    if (err) {
      console.log(`[Error!] ${err}`);
      if (msg.kind === "ObjectID") {
        res.sendStatus(404);
      } else {
        res.status(400).json({
          msg: err.message,
        });
      }
      return;
    }
    // console.log(data);

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
  "/replies-on-reply/:replyId",
  verifyToken, checkWriter, 
  async (req, res, next) => {
    const replyId = req.params.replyId;

    await Feedback.deleteByParentId(replyId, (err, data) => {
      if (err) {
        console.log(`[Error!] ${err}`);
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

module.exports = router;
