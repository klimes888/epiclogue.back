import { Router } from 'express'
const follow = new Router({ mergeParams: true })
import { verifyToken } from '../../../lib/middleware/tokenAuth'
import { checkUserExistence } from '../../../lib/middleware/checkExistence'
import * as followCtrl from './follow.ctrl'

follow.get('/followingList', verifyToken, followCtrl.getFollowing)
follow.get('/followerList', verifyToken, followCtrl.getFollower)
follow.post('/', verifyToken, checkUserExistence, followCtrl.addFollow)
follow.delete('/', verifyToken, checkUserExistence, followCtrl.deleteFollow)

export default follow
