var express = require("express");
var router = express.Router();
const { verifyToken } = require("./authorization");
import { Like } from '../models/like'

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
