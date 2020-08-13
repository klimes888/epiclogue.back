import express from "express";
const router = express.Router({
  mergeParams: true,
});

import { verifyToken, checkWriter } from "./authorization";
import Reply from "../models/reply";

/* 
  This is reply router.
  base url: /:userId/boards/:boardId/reply
*/

// 대댓글 생성
router.post("/", verifyToken, async (req, res, next) => {
  const replyForm = {
    userId: res.locals.uid,
    boardId: req.params.boardId,
    parentId: req.body.parentId,
    replyBody: req.body.replyBody,
  };

  try {
    await Reply.create(replyForm);
    const newerReplyData = await Reply.getByParentId(parentId);
    return res.status(200).json({
      result: "ok",
      data: newerReplyData,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

// 댓글 하위의 대댓글 뷰
router.get("/:parentId", verifyToken, async (req, res, next) => {
  const parentId = req.params.parentId;

  try {
    const replyData = await Reply.getByParentId(parentId);
    return res.status(200).json({
      result: "ok",
      data: replyData,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

router.patch("/:replyId", verifyToken, checkWriter, async (req, res, next) => {
  const newForm = {
    replyId: req.params.replyId,
    newReplyBody: req.body.newReplyBody,
  };

  try {
    const patchResult = await Reply.update(newForm);
    const parentId = await Reply.getParentId(req.params.replyId);

    if (patchResult.ok === 1) {
      if (patchResult.n === 1 && patchResult.n === patchResult.nModified) {
        const newerReplyData = await Reply.getByParentId(parentId);
        return res.status(200).json({
          result: "ok",
          data: newerReplyData,
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
    }
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

router.delete("/:replyId", verifyToken, checkWriter, async (req, res, next) => {
  const replyId = req.params.replyId;

  try {
    const parentId = await Reply.getById(replyId);
    const deleteResult = await Reply.delete(replyId, { parentId: 1 });
    if (deleteResult.ok === 1) {
      const newerReplyData = await Reply.getByParentId(parentId);

      if (
        deleteResult.n === 1 &&
        deleteResult.n === deleteResult.deletedCount
      ) {
        return res.send(200).json({
          result: "ok",
          data: newerReplyData,
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
    } else {
      return res.status(500).json({
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
});

module.exports = router;
