import { Router } from 'express';
import * as myboardCtrl from './myboard.ctrl';
import { authToken } from '../../lib/middleware/tokenAuth';
import { checkUserExistence } from '../../lib/middleware/checkExistence';

const myboard = new Router({ mergeParams: true });

myboard.get('/:screenId/all', authToken, checkUserExistence, myboardCtrl.allWorks);
myboard.get('/:screenId/originals', authToken, checkUserExistence, myboardCtrl.originals);
myboard.get(
  '/:screenId/secondaryWorks',
  authToken,
  checkUserExistence,
  myboardCtrl.secondaryWorks
);
myboard.get('/:screenId/bookmarks', authToken, checkUserExistence, myboardCtrl.bookmarks);
myboard.get('/:screenId', authToken, checkUserExistence, myboardCtrl.getMyboard);

export default myboard;
