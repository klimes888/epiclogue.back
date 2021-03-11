import { Router } from 'express'
import * as bookmarkCtrl from './bookmark.ctrl'
import { authToken } from '../../../lib/middleware/tokenAuth'
import { checkExistence } from '../../../lib/middleware/checkExistence'

const bookmark = new Router({ mergeParams: true })

bookmark.get('/', authToken, bookmarkCtrl.getBookmarkList)
bookmark.post('/', authToken, checkExistence, bookmarkCtrl.addBookmark)
bookmark.delete('/', authToken, checkExistence, bookmarkCtrl.deleteBookmark)

export default bookmark
