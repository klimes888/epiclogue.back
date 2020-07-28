var express = require("express");
var router = express.Router();

const Board = require("../models/board");
const feedback = require("../models/feedback");
const Reply = require("../models/reply");
const { verifyToken, checkWriter } = require("./authorization");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(201).json({
    result: "ok",
    comment: "server is ok",
  });
});

module.exports = router;
