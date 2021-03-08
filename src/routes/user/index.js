import express from 'express';
import { authToken } from '../../lib/middleware/tokenAuth';
import * as userCtrl from './user.ctrl';
import { uploadUserImage } from '../../lib/imageCtrl';

const user = express.Router();

user.get('/editProfile', authToken, userCtrl.getUserEditInfo);
user.post('/editProfile', authToken, uploadUserImage.any(), userCtrl.postUserEditInfo);
user.patch('/changePass', authToken, userCtrl.changePass);
user.delete('/', authToken, userCtrl.deleteUser);

export default user;
