import { Router } from 'express';
import * as bookmarkCtrl from './bookmark.ctrl';
import { verifyToken } from '../../../lib/middleware/tokenAuth';
import { checkExistence } from '../../../lib/middleware/checkExistence';

const bookmark = new Router({ mergeParams: true });

bookmark.get('/', verifyToken, bookmarkCtrl.getBookmarkList);
bookmark.post('/', verifyToken, checkExistence, bookmarkCtrl.addBookmark);
bookmark.delete('/', verifyToken, checkExistence, bookmarkCtrl.deleteBookmark);

export default bookmark;
