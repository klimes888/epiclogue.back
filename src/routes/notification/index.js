import express from 'express'
import * as notiCtrl from './notification.ctrl'
import { verifyToken } from '../../lib/middleware/tokenAuth'
const noti = express.Router({
  mergeParams: true,
})

noti.get('/', verifyToken, notiCtrl.getNoti)
noti.delete('/:notiId', verifyToken, notiCtrl.deleteNoti)
noti.delete('/all', verifyToken, notiCtrl.deleteAll)

export default noti
