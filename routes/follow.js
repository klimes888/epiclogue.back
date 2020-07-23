import { Router } from 'express'
const router = new Router();

import { verifyToken, checkWriter } from "./authorization";
import Follow from "../models/follow";

router.get('/', verifyToken, async (req, res, next) => {
  res.sendStatus(200);
})




module.exports = router;