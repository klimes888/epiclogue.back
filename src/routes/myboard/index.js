import { Router } from 'express';
import * as myboardCtrl from './myboard.ctrl';
import { verifyToken } from '../../lib/middleware/tokenAuth';
import { checkUserExistence } from '../../lib/middleware/checkExistence';

const myboard = new Router({ mergeParams: true });

myboard.get('/:screenId/all', verifyToken, checkUserExistence, myboardCtrl.allWorks);
myboard.get('/:screenId/originals', verifyToken, checkUserExistence, myboardCtrl.originals);
myboard.get(
  '/:screenId/secondaryWorks',
  verifyToken,
  checkUserExistence,
  myboardCtrl.secondaryWorks
);
myboard.get('/:screenId/bookmarks', verifyToken, checkUserExistence, myboardCtrl.bookmarks);
myboard.get('/:screenId', verifyToken, checkUserExistence, myboardCtrl.getMyboard);

export default myboard;
