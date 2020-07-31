var express = require("express");
var router = express.Router({
  mergeParams: true,
});
const { verifyToken } = require("./authorization");
const Like = require("../models/like");

/* url: /:screenId/like */
router.post("/", verifyToken, async (req, res, next) => {
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

router.get("/", (req, res, next) => {
  const userId = req.params.screenId;
  const likeList = [];

  Like.getLikeList(userId)
    .exec()
    .then(async (likeObjectIdList) => {
      for (let data of likeObjectIdList) {
        if (data.targetType === "board") {
          await Board.getArticle(data.targetId, (err, result) => {
            if (err) {
              console.error(err);
              res.sendStatus(500);
              return;
            }
            likeList.push(result);
          });
          // 명칭 수정 필요. 댓글: comment, 대댓글: reply
        } else if (data.targetType === "comment") {
          await Reply.getById(data.targetId, (err, result) => {
            if (err) {
              console.error(err);
              res.sendStatus(500);
              return;
            }
            likeList.push(result);
          });
        } else if (data.targetType === "reply") {
          await ReplyOnReply.getById(data.targetId, (err, result) => {
            if (err) {
              console.error(err);
              res.sendStatus(500);
              return;
            }
            likeList.push(result);
          });
        }
      }
      return likeList;
    })
    .then((resultSet) => {
      console.log(resultSet);
      res.status(200).json(resultSet);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

module.exports = router;
