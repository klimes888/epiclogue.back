import { Router } from 'express'
const like = new Router()
import * as likeCtrl from './like.ctrl'
import { verifyToken } from '../../../lib/middleware/tokenAuth'
import { checkExistence } from '../../../lib/middleware/checkExistence'

like.get('/', verifyToken, likeCtrl.getLikeList)
like.post('/', verifyToken, checkExistence, likeCtrl.addLike)
like.delete('/', verifyToken, checkExistence, likeCtrl.deleteLike)

export default like
