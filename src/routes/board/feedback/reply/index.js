import { Router } from 'express'
import * as replyCtrl from './reply.ctrl'
import { authToken } from '../../../../lib/middleware/tokenAuth'
import { checkWriter } from '../../../../lib/middleware/checkPermission'
import { checkExistence } from '../../../../lib/middleware/checkExistence'

const reply = Router({ mergeParams: true })

reply.get('/', authToken, checkExistence, replyCtrl.getReplys)
reply.post('/', authToken, checkExistence, replyCtrl.postReply)
reply.patch('/:replyId', authToken, checkExistence, checkWriter, replyCtrl.editReply)
reply.delete('/:replyId', authToken, checkExistence, checkWriter, replyCtrl.deleteReply)

export default reply
