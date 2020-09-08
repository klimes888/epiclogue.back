import {Router} from 'express'
const board = new Router();
import * as boardCtrl from './board.ctrl'
import feedback from './feedback'
import {verifyToken} from '../../lib/middleware/tokenAuth'
import {checkWriter} from '../../lib/middleware/checkPermission'
import upload from '../../lib/common/imageUpload'

board.get('/', verifyToken, boardCtrl.getBoards)
board.post('/', verifyToken, upload.any(), boardCtrl.postBoard)
board.get('/:boardId', verifyToken, checkWriter, boardCtrl.getEditInfo)
board.get('/:boardId', verifyToken, boardCtrl.viewBoard)
board.post('/:boardId', verifyToken, checkWriter, boardCtrl.postEditInfo)
board.delete('/:boardId', verifyToken, checkWriter, boardCtrl.deleteBoard)
board.use('/:boardId/feedback', feedback)

export default board