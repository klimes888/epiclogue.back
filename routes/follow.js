import { Router } from "express";
const router = new Router({
  mergeParams: true,
});

import { verifyToken, checkWriter } from "./authorization";
import Follow from "../models/follow";


/* 
  This is follow router.
  base url: /:screenId/follow
*/

router.post("/", verifyToken, async (req, res, next) => {
  const followData = {
    userId: res.locals.uid,
    targetUserId: req.body.targetUserId,
  };
  
  /* 유저 검증 필요(존재 유무, 플텍 계정의 경우 팔로우 승인 과정 필요) */

  try {
    await Follow.follow(followData);
    return res.sendStatus(201)
  } catch (e) {
    console.error(e);
    return res.status(400).json({
      msg: e.message
    })
  }
});

router.delete("/", verifyToken, async (req, res, next) => {
  const followData = {
    userId: res.locals.uid,
    targetUserId: req.body.targetUserId,
  };
  
  /* 유저 검증 필요(존재 유무, 플텍 계정의 경우 팔로우 승인 과정 필요) */

  try {
    await Follow.unfollow(followData)
    return res.sendStatus(200)
  } catch (e) {
    console.error(e);
    return res.status(400).json({
      msg: e.message
    })
  }
});

module.exports = router;
