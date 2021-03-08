import { Router } from 'express';
import * as boardCtrl from './board.ctrl';
import feedback from './feedback';
import react from './react';
import { authToken } from '../../lib/middleware/tokenAuth';
import { checkWriter } from '../../lib/middleware/checkPermission';
import { checkExistence } from '../../lib/middleware/checkExistence';
import { uploadImage } from '../../lib/imageCtrl';
import checkSecondaryAllow from '../../lib/middleware/checkSecondaryAllow';

const board = new Router({ mergeParams: true });

board.get('/', authToken, boardCtrl.getBoards);
board.post('/', authToken, uploadImage.any(), boardCtrl.postBoard);
board.post('/sec', authToken, uploadImage.any(), checkSecondaryAllow, boardCtrl.secPost);
board.get('/:boardId', authToken, checkExistence, boardCtrl.viewBoard);
board.delete('/:boardId', authToken, checkExistence, checkWriter, boardCtrl.deleteBoard);
board.get('/:boardId/edit', authToken, checkExistence, checkWriter, boardCtrl.getEditInfo);
board.post(
  '/:boardId/edit',
  authToken,
  checkExistence,
  checkWriter,
  uploadImage.any(),
  boardCtrl.postEditInfo
);
board.use('/:boardId/feedback', checkExistence, feedback);
board.use('/:boardId/react', checkExistence, react);

export default board;
