import { Router } from "express";
const router = new Router({
  mergeParams: true,
});

import { verifyToken, checkWriter } from "./authorization";
import Follow from "../models/follow";

router.get("/", verifyToken, async (req, res, next) => {
  res.status(405).json({
    msg: "Server is alive... But this is not allowed method.",
  });
});

router.post("/", verifyToken, (req, res, next) => {
  const followState = req.body.followState;
  const followData = {
    userId: res.locals.uid,
    targetUserId: req.body.targetUserId,
  };
  /* 유저 검증 필요(존재 유무, 플텍 계정의 경우 팔로우 승인 과정 필요) */

  if (followState === 'true' || followState === true) {
    Follow.follow(followData, (err, data) => {
      if (err) {
        console.log(`[LOG] Error: ${err}`);
        res.sendStatus(400);
      }
      res.sendStatus(201);
    });
  } else if (followState === 'false' || followState === false) {
    Follow.unfollow(followData, (err, data) => {
      if (err) {
        console.log(`[LOG] Error: ${err}`);
        res.sendStatus(400);
      }
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(405);
  }
});

module.exports = router;
