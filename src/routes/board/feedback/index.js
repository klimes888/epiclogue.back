import { Router } from 'express'
const feedback = new Router({ mergeParams: true })
import * as feedbackCtrl from './feedback.ctrl'
import reply from './reply'
import { verifyToken } from '../../../lib/middleware/tokenAuth'
import { checkWriter } from '../../../lib/middleware/checkPermission'

feedback.post('/', verifyToken, feedbackCtrl.postFeedback)
feedback.patch('/:feedbackId', verifyToken, checkWriter, feedbackCtrl.editFeedback)
feedback.delete('/:feedbackId', verifyToken, checkWriter, feedbackCtrl.deleteFeedback)
feedback.use('/:feedbackId/reply', reply)

export default feedback
