var express = require("express");
var router = express.Router({
  mergeParams: true,
});
const { verifyToken } = require("./authorization");
const Like = require("../models/like");

/* url: /board/view/:boardId/like */
router.post("/like", verifyToken, async (req, res, next) => {
  const likeData = {
    userId: res.locals.uid,
    targetType: req.body.targetType,
    targetId: req.body.targetId,
  };
  const { toggleHeart } = req.body;

  if (toggleHeart === true || toggleHeart === "true") {
    Like.like(likeData, (err, data) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(201);
    });
  } else if (toggleHeart === false || toggleHeart === "false") {
    Like.unlike(likeData, (err, data) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(405);
  }
});

router.post("/unlike", verifyToken, async function (req, res, next) {
  const unlikeData = {
    userId: res.locals.uid,
    targetType: req.body.targetType,
    targetId: req.body.targetId,
  };
  const { toggleHeart } = req.body;

  if (toggleHeart === true || toggleHeart === "true") {
    Like.unlike(unlikeData, (err, data) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(201);
    });
  } else if (toggleHeart === false || toggleHeart === "false") {
    Like.unlike(unlikeData, (err, data) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(405);
  }
});

module.exports = router;
