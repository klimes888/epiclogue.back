import express from "express";
const router = express.Router({
  mergeParams: true
});

import { verifyToken, checkWriter } from "./authorization";
import Feedback from "../models/feedback";

/*
  This is reply router.
  Base url: /{screen-id}/posts/{board-id}/feedback
*/

router.post("/", verifyToken, async (req, res, next) => {
  const feedbackData = {
    userId: res.locals.uid,
    boardId: req.params.boardId,
    feedbackBody: req.body.feedbackBody
  }

  try {
    await Feedback.create(feedbackData);
    return res.sendStatus(201)
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(400).json({
      msg: e.message
    })
  }
});

router.patch("/:feedbackId", verifyToken, checkWriter, async (req, res, next) => {
  const newForm = {
    feedbackId: req.params.feedbackId,
    newFeedbackBody: req.body.newFeedbackBody,
  };

  try {
    const patchResult = await Feedback.update(newForm);

    if (patchResult.ok === 1) {
      if (patchResult.n === 1 && patchResult.n === patchResult.nModified) {
        return res.sendStatus(200);
      } else if (patchResult.n === 1 && patchResult.n !== patchResult.nModified) {
        return res.status(200).json({
          msg: "질의에 성공했으나 데이터가 수정되지 않았습니다.",
        });
      } else if (patchResult.n === 0) {
        return res.status(404).json({
          msg: "존재하지 않는 데이터에 접근했습니다.",
        });
      }
    } else {
      return res.status(500).json({
        msg: `데이터베이스 질의 실패; ${patchResult.ok}`,
      });
    }
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(400).json({
      msg: e
    })
  }
});

router.delete("/:feedbackId", verifyToken, checkWriter, async (req, res, next) => {
  const feedbackId = req.params.feedbackId;

  try {
    const deleteResult = await Feedback.delete(feedbackId);
    
    if (deleteResult.ok === 1) {
      if (deleteResult.n === 1 && deleteResult.n === deleteResult.deletedCount) {
        return res.sendStatus(200);
      } else if (deleteResult.ok === 1 && deleteResult.n !== deleteResult.deletedCount) {
        return res.status(200).json({
          msg: "질의에 성공했으나 데이터가 삭제되지 않았습니다.",
        });
      } else if (deleteResult.n === 0) {
        return res.status(404).json({
          msg: "존재하지 않는 데이터에 접근했습니다.",
        });
      }
    } else if (deleteResult.ok === 0) {
      res.status(400).json({
        msg: "데이터베이스 질의 실패",
      });
    }
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(400).json({
      msg: e
    })
  }
});

module.exports = router;
