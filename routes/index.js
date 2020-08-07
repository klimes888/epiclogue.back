import express from "express";
import user from "../models/users"
import board from "../models/board"
const router = express.Router({
  mergeParams: true,
});

router.get("/", (req, res, next) => {
  res.status(201).json({
    result: "ok",
    comment: "server is ok",
  });
});

module.exports = router;
