import { Router } from 'express'
const myboard = new Router({ mergeParams: true })
import * as myboardCtrl from './myboard.ctrl'
import { verifyToken } from '../../lib/middleware/tokenAuth'

myboard.get('/:screenId', verifyToken, myboardCtrl.allWorks)
myboard.get('/:screenId/originals', verifyToken, myboardCtrl.myContents)
myboard.get('/:screenId/secondary_works', verifyToken, myboardCtrl.secondaryWorks)
myboard.get('/:screenId/bookmarks', verifyToken, myboardCtrl.bookmarks)

export default myboard