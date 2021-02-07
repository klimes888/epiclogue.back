import { Router } from 'express';
import * as feedbackCtrl from './feedback.ctrl';
import reply from './reply';
import { verifyToken } from '../../../lib/middleware/tokenAuth';
import { checkWriter } from '../../../lib/middleware/checkPermission';
import { checkExistence } from '../../../lib/middleware/checkExistence';

const feedback = new Router({ mergeParams: true });

feedback.post('/', verifyToken, feedbackCtrl.postFeedback);
feedback.get('/:feedbackId', verifyToken, checkExistence, feedbackCtrl.getFeedback);
feedback.patch('/:feedbackId', verifyToken, checkExistence, checkWriter, feedbackCtrl.editFeedback);
feedback.delete(
  '/:feedbackId',
  verifyToken,
  checkExistence,
  checkWriter,
  feedbackCtrl.deleteFeedback
);
feedback.use('/:feedbackId/reply', reply);

export default feedback;
