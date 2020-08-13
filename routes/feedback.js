import express from "express";
const router = express.Router({
  mergeParams: true,
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
    feedbackBody: req.body.feedbackBody,
  };

  try {
    await Feedback.create(feedbackData);
    const newerFeedbackData = await Feedback.getByBoardId(req.params.boardId);
    return res.status(201).json({
      result: "ok",
      data: newerFeedbackData,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

router.patch(
  "/:feedbackId",
  verifyToken,
  checkWriter,
  async (req, res, next) => {
    const newForm = {
      feedbackId: req.params.feedbackId,
      newFeedbackBody: req.body.newFeedbackBody,
    };
    const boardId = req.params.boardId;

    try {
      const patchResult = await Feedback.update(newForm);

      if (patchResult.ok === 1) {
        if (patchResult.n === 1 && patchResult.n === patchResult.nModified) {
          const newerFeedbackData = await Feedback.getByBoardId(boardId);
          return res.status(200).json({
            result: "ok",
            data: newerFeedbackData,
          });
        } else if (
          patchResult.n === 1 &&
          patchResult.n !== patchResult.nModified
        ) {
          return res.status(200).json({
            result: "ok",
            message: "질의에 성공했으나 데이터가 수정되지 않았습니다.",
          });
        } else if (patchResult.n === 0) {
          return res.status(404).json({
            result: "error",
            message: "존재하지 않는 데이터에 접근했습니다.",
          });
        }
      } else {
        return res.status(500).json({
          result: "error",
          message: `데이터베이스 질의 실패; ${patchResult.ok}`,
        });
      }
    } catch (e) {
      console.error(`[Error] ${e}`);
      return res.status(500).json({
        result: "error",
        message: e.message,
      });
    }
  }
);

router.delete(
  "/:feedbackId",
  verifyToken,
  checkWriter,
  async (req, res, next) => {
    const feedbackId = req.params.feedbackId;

    try {
      const deleteResult = await Feedback.delete(feedbackId);
      const boardId = req.params.boardId;

      if (deleteResult.ok === 1) {
        if (
          deleteResult.n === 1 &&
          deleteResult.n === deleteResult.deletedCount
        ) {
          const newerFeedbackData = await Feedback.getByBoardId(boardId);
          return res.status(200).json({
            result: "ok",
            data: newerFeedbackData,
          });
        } else if (
          deleteResult.ok === 1 &&
          deleteResult.n !== deleteResult.deletedCount
        ) {
          return res.status(200).json({
            result: "ok",
            message: "질의에 성공했으나 데이터가 삭제되지 않았습니다.",
          });
        } else if (deleteResult.n === 0) {
          return res.status(404).json({
            result: "error",
            message: "존재하지 않는 데이터에 접근했습니다.",
          });
        }
      } else if (deleteResult.ok === 0) {
        res.status(500).json({
          result: "error",
          message: "데이터베이스 질의 실패",
        });
      }
    } catch (e) {
      console.error(`[Error] ${e}`);
      return res.status(500).json({
        result: "error",
        message: e.message,
      });
    }
  }
);

module.exports = router;
