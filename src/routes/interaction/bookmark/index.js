import { Router } from 'express'
const bookmark = new Router()
import * as bookmarkCtrl from './bookmark.ctrl'
import { verifyToken } from '../../../lib/middleware/tokenAuth'
import { checkExistence } from '../../../lib/middleware/checkExistence'

bookmark.get('/', verifyToken, bookmarkCtrl.getBookmarkList)
bookmark.post('/', verifyToken, checkExistence, bookmarkCtrl.addBookmark)
bookmark.delete('/', verifyToken, checkExistence, bookmarkCtrl.deleteBookmark)

export default bookmark
