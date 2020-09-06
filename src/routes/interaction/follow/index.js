import {Router} from 'express';
const follow = new Router();
import { verifyToken } from '../../../lib/middleware/tokenAuth';
import * as followCtrl from './follow.ctrl';

follow.get('/followingList', verifyToken, followCtrl.getFollowing);
follow.get('/followerList', verifyToken, followCtrl.getFollower)
follow.post('/', verifyToken, followCtrl.addFollow);
follow.delete('/', verifyToken, followCtrl.deleteFollow);

export default follow;