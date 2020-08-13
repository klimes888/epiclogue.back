import { Router } from "express";
import { verifyToken } from "./authorization";
import Bookmark from "../models/bookmark";
import react from "../models/react";
import  user  from "../models/users"
const router = new Router({
  mergeParams: true,
});

/* 
  This is bookmark router.
  base url: /:screenId/bookmark
*/
router.get("/", verifyToken, async (req, res, next) => {
  const screenId = req.params.screenId;

  try {
    const result = await Bookmark.getByUserId(screenId);
    return res.status(200).json(result);
  } catch (e) {
    console.log(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message
    })
  }
});

router.post("/", verifyToken, async function (req, res, next) {
  const bookmarkData = {
    userId: res.locals.uid,
    boardId: req.body.boardId,
  };

  const reactData = {
    userId: res.locals.uid,
    boardId: req.body.boardId,
    type: "bookmark"
  }

  try {
    await Bookmark.create(bookmarkData);
    await react.create(reactData);
    return res.status(201).json({
      result: 'ok'
    })
  } catch (e) {
    console.log(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message
    })
  }
});

router.delete("/", verifyToken, async (req, res, next) => {
  const userId = res.locals.uid;
  const boardId = req.body.boardId;

  try {
    await Bookmark.delete(userId, boardId);
    await react.delete(userId, boardId);
    return res.status(200).json({
      result: 'ok'
    })
  } catch (e) {
    console.log(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message
    })
  }
});

module.exports = router;
