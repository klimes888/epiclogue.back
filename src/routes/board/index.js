import {Router} from 'express'
const board = new Router();
import * as boardCtrl from './board.ctrl'
import feedback from './feedback'
import {verifyToken} from '../../lib/middleware/tokenAuth'
import {checkWriter} from '../../lib/middleware/checkPermission'

board.get('/', verifyToken, boardCtrl.getBoards)
board.get('/:boardId', verifyToken, checkWriter, boardCtrl.getEditInfo)
board.get('/:boardId', verifyToken, boardCtrl.viewBoard)
board.post('/:boardId', verifyToken, checkWriter, boardCtrl.postEditInfo)
board.post('/', verifyToken, boardCtrl.postBoard)
board.delete('/:boardId', verifyToken, checkWriter, boardCtrl.deleteBoard)
board.use('/:boardId/feedback', feedback)

export default board