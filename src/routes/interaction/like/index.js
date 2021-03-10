import { Router } from 'express'
import * as likeCtrl from './like.ctrl'
import { authToken } from '../../../lib/middleware/tokenAuth'
import { checkExistence } from '../../../lib/middleware/checkExistence'

const like = new Router()

like.get('/', authToken, likeCtrl.getLikeList)
like.post('/', authToken, checkExistence, likeCtrl.addLike)
like.delete('/', authToken, checkExistence, likeCtrl.deleteLike)

export default like
