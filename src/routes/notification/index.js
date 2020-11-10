import express from 'express'
import * as notiCtrl from './notification.ctrl'
import { verifyToken } from '../../lib/middleware/tokenAuth'
const noti = express.Router({
  mergeParams: true,
})

noti.get('/:targetId', verifyToken, notiCtrl.getNoti)
noti.post('/:targetId', verifyToken, notiCtrl.setRead)

export default noti
