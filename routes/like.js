import express from "express";
const router = express.Router({
  mergeParams: true,
});
const { verifyToken } = require("./authorization");
const Like = require("../models/like");
const Feedback = require('../models/feedback')
const Board = require('../models/board');
const Reply = require('../models/reply');
const reply = require("../models/reply");
import react from '../models/react'

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
        type: "like"
      }
      await react.create(reactData)
    }
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: err
    })
  }
});

router.delete("/", verifyToken, async (req, res, next) => {
  const likeData = {
    userId: res.locals.uid,
    targetType: req.body.targetType,
    targetId: req.body.targetId,
  };

  try {
    const result = await Like.unlike(likeData);
    if (likeData.targetType === "board") {
      const userId = res.locals.uid;
      const boardId = req.body.targetId;

      await react.delete(userId, boardId);
    }
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

router.get("/", (req, res, next) => {
  const userId = req.params.screenId;
  const likeList = [];

  Like.getByUserId(userId)
    .exec()
    .then(async (likeObjectIdList) => {
      for (let data of likeObjectIdList) {
        if (data.targetType === "board") {
          await Board.getById(data.targetId, (err, result) => {
            if (err) {
              console.error(err);
              res.sendStatus(500);
              return;
            }
            likeList.push(result);
          });
          // 명칭 수정 필요. 댓글: comment, 대댓글: reply
        } else if (data.targetType === "feedback") {
          await Feedback.getById(data.targetId, (err, result) => {
            if (err) {
              console.error(err);
              res.sendStatus(500);
              return;
            }
            likeList.push(result);
          });
        } else if (data.targetType === "reply") {
          await Reply.getById(data.targetId, (err, result) => {
            if (err) {
              console.error(err);
              res.sendStatus(500);
              return;
            }
            reply.type = "reply";
            likeList.push(result);
          });
        }
      }
      return likeList;
    })
    .then((resultSet) => {
      console.log(resultSet);
      res.status(200).json(resultSet);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

module.exports = router;
