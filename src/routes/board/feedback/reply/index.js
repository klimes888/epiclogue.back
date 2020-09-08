import {Router} from 'express'
const reply = new Router({mergeParams: true});
import * as replyCtrl from './reply.ctrl'
import {verifyToken} from '../../../../lib/middleware/tokenAuth'
import {checkWriter} from '../../../../lib/middleware/checkPermission'

reply.get('/', verifyToken, replyCtrl.getReplys)
reply.post('/', verifyToken, replyCtrl.postReply)
reply.patch('/', verifyToken, checkWriter, replyCtrl.editReply)
reply.delete('/', verifyToken, checkWriter, replyCtrl.deleteReply)

export default reply