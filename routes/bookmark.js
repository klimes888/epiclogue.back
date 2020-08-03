import { Router, response } from "express";
import { verifyToken } from "./authorization";
import Bookmark from "../models/bookmark";
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

  try {
    await Bookmark.create(bookmarkData);
  } catch (err) {
    console.log(`[Error] ${err}`);
    res.status(500).json({
      msg: err
    })
  }
});

router.delete("/", verifyToken, async (req, res, next) => {
  const bookmarkData = {
    userId: res.locals.uid,
    boardId: req.body.boardId,
  };

  try {
    await Bookmark.delete(bookmarkData);
    res.sendStatus(200);
  } catch (err) {
    console.log(`[Error] ${err}`);
    res.status(500).json({
      msg: err
    })
  }
});

module.exports = router;
