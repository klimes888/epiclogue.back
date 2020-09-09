import { Router } from 'express'
const board = new Router()
import * as boardCtrl from './board.ctrl'
import feedback from './feedback'
import { verifyToken } from '../../lib/middleware/tokenAuth'
import { checkWriter } from '../../lib/middleware/checkPermission'
import upload from '../../lib/common/imageUpload'

board.get('/', verifyToken, boardCtrl.getBoards)
board.post('/', verifyToken, upload.any(), boardCtrl.postBoard)
board.get('/:boardId', verifyToken, boardCtrl.viewBoard)
board.delete('/:boardId', verifyToken, checkWriter, boardCtrl.deleteBoard)
board.get('/:boardId/edit', verifyToken, checkWriter, boardCtrl.getEditInfo)
board.post('/:boardId/edit', verifyToken, checkWriter, boardCtrl.postEditInfo)
board.use('/:boardId/feedback', feedback)

export default board
