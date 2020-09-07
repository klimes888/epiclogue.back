import express from 'express'
const user = express.Router();
import { verifyToken } from '../../lib/middleware/tokenAuth'
import * as userCtrl from './user.ctrl'

user.get('/editProfile', verifyToken, userCtrl.getUserEditInfo);
user.post('/editProfile', verifyToken, userCtrl.postUserEditInfo);
user.patch('/changePass', verifyToken, userCtrl.changePass);
user.delete('/', verifyToken, userCtrl.deleteUser);

export default user