import { Router } from 'express'
const follow = new Router()
import { verifyToken } from '../../../lib/middleware/tokenAuth'
import { checkUserExistence } from '../../../lib/middleware/checkExistence'
import * as followCtrl from './follow.ctrl'

follow.get('/', verifyToken, checkUserExistence, followCtrl.getFollow)
follow.post('/', verifyToken, checkUserExistence, followCtrl.addFollow)
follow.delete('/', verifyToken, checkUserExistence, followCtrl.deleteFollow)

export default follow
