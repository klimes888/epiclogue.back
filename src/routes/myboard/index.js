import { Router } from 'express'
const myboard = new Router({ mergeParams: true })
import * as myboardCtrl from './myboard.ctrl'
import { verifyToken } from '../../lib/middleware/tokenAuth'

myboard.get('/:screenId', verifyToken, myboardCtrl.allWorks)
myboard.get('/:screenId/originals', verifyToken, myboardCtrl.originals)
myboard.get('/:screenId/secondaryWorks', verifyToken, myboardCtrl.secondaryWorks)
myboard.get('/:screenId/bookmarks', verifyToken, myboardCtrl.bookmarks)

export default myboard