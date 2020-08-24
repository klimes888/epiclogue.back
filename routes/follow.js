import { Router } from "express";
const router = new Router({
  mergeParams: true,
});

import { verifyToken } from "./authorization";
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
    const result = await Follow.follow(followData);
    console.log(typeof result)
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
  const followData = {
    userId: res.locals.uid,
    targetUserId: req.body.targetUserId,
  };

  /* 유저 검증 필요(존재 유무, 플텍 계정의 경우 팔로우 승인 과정 필요) */

  try {
    const unfollowResult = await Follow.unfollow(followData);
    
    if (unfollowResult.ok === 1) {
      if (
        unfollowResult.n === 1 &&
        unfollowResult.n === unfollowResult.deletedCount
      ) {
        return res.send(200).json({
          result: "ok",
        });
      } else if (
        unfollowResult.ok === 1 &&
        unfollowResult.n !== unfollowResult.deletedCount
      ) {
        return res.status(200).json({
          result: "ok",
          message: "질의에 성공했으나 데이터가 삭제되지 않았습니다.",
        });
      } else if (unfollowResult.n === 0) {
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
      message: e
    });
  }
});

module.exports = router;
