import express from "express";
const router = express.Router({
  mergeParams: true,
});
import { verifyToken } from"./authorization";
import Like from "../../../models/like";
import Feedback from "../../../models/feedback";
import Board from "../../../models/board";
import Reply from "../../../models/reply";
import react from "../../../models/react";

/*
  This is like router
  base url: /:screenId/like 
*/

router.post("/", verifyToken, async (req, res, next) => {
  const likeData = {
    userId: res.locals.uid,
    targetType: req.body.targetType,
    targetId: req.body.targetId,
  };

  try {
    await Like.like(likeData);
    console.log(`[INFO] 유저 ${res.locals.uid}가 ${likeData.targetType}: ${likeData.targetId}를 좋아합니다.`)
    if (likeData.targetType === "board") {
      const reactData = {
        userId: res.locals.uid,
        boardId: req.body.targetId,
        type: "like",
      };
      await react.create(reactData);
      await Board.countHeart(req.body.targetId, 1)
      await Board.countReact(req.body.targetId, 1)
    } else if (likeData.targetType === "feedback") {
      await Feedback.countHeart(req.body.targetId, 1)
    } else if (likeData.targetType === "reply") {
      await Reply.countHeart(req.body.targetId, 1)
    }
    const newerCount = await Like.getCount(likeData)
    return res.status(201).json({
      result: "ok",
      data: newerCount
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

router.delete("/", verifyToken, async (req, res, next) => {
  const likeData = {
    userId: res.locals.uid,
    targetType: req.body.targetType,
    targetId: req.body.targetId,
  };

  try {
    await Like.unlike(likeData);
    console.log(`[INFO] 유저 ${res.locals.uid}가 ${likeData.targetType}: ${likeData.targetId}의 좋아요를 해제했습니다.`)
    if (likeData.targetType === "board") {
      await react.delete(likeData.userId, likeData.targetId);
      await Board.countHeart(req.body.targetId, 0)
      await Board.countReact(req.body.targetId, 0)
    } else if (likeData.targetType === "feedback") {
      await Feedback.countHeart(req.body.targetId, 0)
    } else if (likeData.targetType === "reply") {
      await Reply.countHeart(req.body.targetId, 0)
    }
    const newerCount = await Like.getCount(likeData)
    return res.status(200).json({
      result: 'ok',
      data: newerCount
    })
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

router.get("/", async (req, res, next) => {
  const userId = req.params.screenId;
  const likeList = [];

  try {
    const likeObjectIdList = await Like.getByUserId(userId);
    for (let data of likeObjectIdList) {
      let result;

      if (data.targetType === "board") {
        result = await Board.getById(data.targetId);
      } else if (data.targetType === "feedback") {
        result = await Feedback.getById(data.targetId);
      } else if (data.targetType === "reply") {
        result = await Reply.getById(data.targetId);
      }
      likeList.push(result);
    }
    console.log(`[INFO] 유저 ${res.locals.uid}가 유저 ${userId}의 좋아요 리스트를 확인했습니다.`)
    return res.status(200).json({
      result: "ok",
      data: likeList,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

module.exports = router;
