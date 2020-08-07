import express from "express";
import user from "../models/users";
import board from "../models/board";
const router = express.Router();

/* 검색 전 미리보기 기능 */
router.get("/", async (req, res, next) => {
  const queryString = req.query.q;

  try {
    if (queryString[0] === "#") { // tag searching
      const _query = queryString.slice(1, queryString.length);
      
      /* Tag schema 추가 필요 */

    } else if (queryString[0] === "@") { // user searching
      const _query = queryString.slice(1, queryString.length);
      const userData = await user.getByQuery(_query);
      res.status(200).json(userData);
    } else {  // title searching
      const boardData = await board.getByQuery(queryString);
      res.status(200).json(boardData);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500)
  }
});

module.exports = router;
