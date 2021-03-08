import express from 'express';
import * as notiCtrl from './notification.ctrl';
import { authToken } from '../../lib/middleware/tokenAuth';

const noti = express.Router({
  mergeParams: true,
});

noti.get('/', authToken, notiCtrl.getNoti);
noti.get('/check', authToken, notiCtrl.checkNotified);
noti.patch('/', authToken, notiCtrl.setRead);
noti.patch('/all', authToken, notiCtrl.setReadAll);
noti.delete('/', authToken, notiCtrl.deleteNoti);
noti.delete('/all', authToken, notiCtrl.deleteAll);

export default noti;
