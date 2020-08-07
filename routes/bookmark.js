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
    res.status(200).json(result);
  } catch (err) {
    console.log(`[Error] ${err}`);
    res.status(500).json({
      msg: err
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
    res.sendStatus(201)
  } catch (err) {
    console.log(`[Error] ${err}`);
    res.status(500).json({
      msg: err
    })
  }
});

router.delete("/", verifyToken, async (req, res, next) => {
  const userId = res.locals.uid;
  const boardId = req.body.boardId;

  try {
    await Bookmark.delete(userId, boardId);
    await react.delete(userId, boardId);
    res.sendStatus(200);
  } catch (err) {
    console.log(`[Error] ${err}`);
    res.status(500).json({
      msg: err
    })
  }
});

module.exports = router;
