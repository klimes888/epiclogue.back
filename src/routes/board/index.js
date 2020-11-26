import { Router } from 'express'
const board = new Router()
import * as boardCtrl from './board.ctrl'
import feedback from './feedback'
import react from './react'
import { verifyToken } from '../../lib/middleware/tokenAuth'
import { checkWriter } from '../../lib/middleware/checkPermission'
import { checkExistence } from '../../lib/middleware/checkExistence'
import {uploadImage} from '../../lib/imageCtrl'

board.get('/', verifyToken, boardCtrl.getBoards)
board.post('/', verifyToken, uploadImage.any(), boardCtrl.postBoard)
board.post('/sec', verifyToken, boardCtrl.secPost)
board.get('/:boardId', verifyToken, checkExistence, boardCtrl.viewBoard)
board.delete('/:boardId', verifyToken, checkExistence, checkWriter, boardCtrl.deleteBoard)
board.get('/:boardId/edit', verifyToken, checkExistence, checkWriter, boardCtrl.getEditInfo)
board.post('/:boardId/edit', verifyToken, checkExistence, checkWriter, uploadImage.any(), boardCtrl.postEditInfo)
board.use('/:boardId/feedback', checkExistence, feedback)
board.use('/:boardId/react', verifyToken, react)

export default board
