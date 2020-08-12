const express = require('express')
const router = express.Router({
  mergeParams: true
})

router.get("/", function (req, res, next) {
  res.status(201).json({
    result: "ok",
    comment: "server is ok",
  });
});

router.get("/ping", (req, res, next) => {
  res.status(200).send("pong")
})

module.exports = router;
