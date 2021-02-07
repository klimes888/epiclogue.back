import { Router } from 'express';
import * as replyCtrl from './reply.ctrl';
import { verifyToken } from '../../../../lib/middleware/tokenAuth';
import { checkWriter } from '../../../../lib/middleware/checkPermission';
import { checkExistence } from '../../../../lib/middleware/checkExistence';

const reply = new Router({ mergeParams: true });

reply.get('/', verifyToken, checkExistence, replyCtrl.getReplys);
reply.post('/', verifyToken, checkExistence, replyCtrl.postReply);
reply.patch('/:replyId', verifyToken, checkExistence, checkWriter, replyCtrl.editReply);
reply.delete('/:replyId', verifyToken, checkExistence, checkWriter, replyCtrl.deleteReply);

export default reply;
