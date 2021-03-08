import { Router } from 'express';
import { authToken } from '../../../lib/middleware/tokenAuth';
import { checkUserExistence } from '../../../lib/middleware/checkExistence';
import * as followCtrl from './follow.ctrl';

const follow = new Router();

follow.get('/', authToken, checkUserExistence, followCtrl.getFollow);
follow.post('/', authToken, checkUserExistence, followCtrl.addFollow);
follow.delete('/', authToken, checkUserExistence, followCtrl.deleteFollow);

export default follow;
