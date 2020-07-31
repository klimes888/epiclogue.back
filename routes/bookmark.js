import { Router } from "express";
import { verifyToken } from "./authorization";
import Bookmark from "../models/bookmark";
const router = new Router({
  mergeParams: true,
});

router.get("/", verifyToken, async (req, res, next) => {
  const screenId = req.params.screenId;

  Bookmark.getListByScreenId(screenId)
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

router.post("/", verifyToken, async function (req, res, next) {
  const bookmarkData = {
    userId: res.locals.uid,
    boardId: req.body.boardId,
  };

  const toggleBookmark = req.body.toggleBookmark;
  console.log(toggleBookmark)

  if (toggleBookmark === true || toggleBookmark === "true") {
    // schema.save() returns a Promise, don't need to use exec()
    Bookmark.create(bookmarkData)
    .then((result) => {
      console.log(result);
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
  } else if (toggleBookmark === false || toggleBookmark === "false") {
    Bookmark.remove(bookmarkData)
      .exec()
      .then((result) => {
        console.log(result);
        res.sendStatus(200);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  } else {
    res.status(405).json({
      msg: "not allowed",
    });
  }
});

module.exports = router;
