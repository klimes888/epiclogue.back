import express from 'express';
const like = express.Router();
import * as likeCtrl from './like.ctrl'
import {verifyToken} from '../../../lib/middleware/tokenAuth'

like.get('/', verifyToken, likeCtrl.getLikeList);
like.post('/', verifyToken, likeCtrl.addLike);
like.delete('/', verifyToken, likeCtrl.deleteLike);

export default like;