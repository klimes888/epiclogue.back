import { Router } from 'express';
import * as likeCtrl from './like.ctrl';
import { verifyToken } from '../../../lib/middleware/tokenAuth';
import { checkExistence } from '../../../lib/middleware/checkExistence';

const like = new Router();

like.get('/', verifyToken, likeCtrl.getLikeList);
like.post('/', verifyToken, checkExistence, likeCtrl.addLike);
like.delete('/', verifyToken, checkExistence, likeCtrl.deleteLike);

export default like;
