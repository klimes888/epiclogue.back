import {Router} from 'express';
const bookmark = new Router();
import * as bookmarkCtrl from './bookmark.ctrl'
import {verifyToken} from '../../../lib/middleware/tokenAuth'

bookmark.get('/', verifyToken, bookmarkCtrl.getBookmarkList);
bookmark.post('/', verifyToken, bookmarkCtrl.addBookmark);
bookmark.delete('/', verifyToken, bookmarkCtrl.deleteBookmark);

export default bookmark;