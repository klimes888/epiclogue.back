import express from "express";
const router = express.Router({
  mergeParams: true,
});
const { verifyToken } = require("./authorization");
const Like = require("../models/like");
const Feedback = require("../models/feedback");
const Board = require("../models/board");
const Reply = require("../models/reply");
import react from "../models/react";

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
    const result = await Like.like(likeData);
    if (likeData.targetType === "board") {
      const reactData = {
        userId: res.locals.uid,
        boardId: req.body.targetId,
        type: "like",
      };
      await react.create(reactData);
    }
    return res.status(201).json({
      result: "ok",
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
    if (likeData.targetType === "board") {
      await react.delete(likeData.userId, likeData.targetId);
    }
    return res.status(200).json({
      result: 'ok'
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
