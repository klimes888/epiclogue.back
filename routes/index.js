var express = require("express");
var router = express.Router();

const Board = require("../models/board");
const Reply = require("../models/reply");
const ReplyOnReply = require("../models/replyOnReply");
const Follow = require('../models/follow')
const { verifyToken, checkWriter } = require("./authorization");
const { response } = require("express");
import { Like } from '../models/like'

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(201).json({
    result: "ok",
    comment: "server is ok",
  });
});

// Follow
router.post("/follow", verifyToken, (req, res, next) => {
  const followData = {
    userId: res.locals.uid,
    targetUserId: req.body.targetUserId
  }

  Follow.follow(followData, (err, data) => {
    if (err) {
      res.status(400).json({ msg: err })
    }
    console.log(`[LOG] uid ${followData.userId} followed ${followData.targetUserId}`)
    res.sendStatus(201);
  })
})

router.post("/unfollow", verifyToken, (req, res, next) => {
  const unfollowData = {
    userId: res.locals.uid,
    targetUserId: req.body.targetUserId
  }

  Follow.unfollow(unfollowData, (err, data) => {
    if (err) {
      res.status(400).json({ msg: err })
    }
    console.log(`[LOG] uid ${followData.userId} unfollowed ${followData.targetUserId}`)
    res.sendStatus(200);
  })
})

// Like
router.post("/like", verifyToken, (req, res, next) => {
  const likeData = {
    userId: res.locals.uid,
    targetType: req.body.targetType,
    targetId: req.body.targetId
  }
  Like.like(likeData, (err, data) => {
    if (err) {
      console.log(`[Error] ${err}`)
      res.sendStatus(400);
    } else {
      res.sendStatus(201);
    }
  })
});

router.post("/unlike", verifyToken, async function (req, res, next) {
  Like.like(req.body.likeId, (err, data) => {
    if (err) {
      console.log(`[Error] ${err}`)
      res.sendStatus(400);
    } else {
      res.sendStatus(200);
    }
  })
});

module.exports = router;
