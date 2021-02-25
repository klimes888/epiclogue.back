import express from 'express';
import { verifyToken } from '../../lib/middleware/tokenAuth';
import * as userCtrl from './user.ctrl';
import { uploadUserImage } from '../../lib/imageCtrl';

const user = express.Router();

user.get('/editProfile', verifyToken, userCtrl.getUserEditInfo);
user.post('/editProfile', verifyToken, uploadUserImage.any(), userCtrl.postUserEditInfo);
user.patch('/changePass', verifyToken, userCtrl.changePass);
user.delete('/', verifyToken, userCtrl.deleteUser);

export default user;
