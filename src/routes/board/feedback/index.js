import { Router } from 'express'
import * as feedbackCtrl from './feedback.ctrl'
import reply from './reply'
import { authToken } from '../../../lib/middleware/tokenAuth'
import { checkWriter } from '../../../lib/middleware/checkPermission'
import { checkExistence } from '../../../lib/middleware/checkExistence'

const feedback = Router({ mergeParams: true })

feedback.post('/', authToken, feedbackCtrl.postFeedback)
feedback.get('/:feedbackId', authToken, checkExistence, feedbackCtrl.getFeedback)
feedback.patch('/:feedbackId', authToken, checkExistence, checkWriter, feedbackCtrl.editFeedback)
feedback.delete('/:feedbackId', authToken, checkExistence, checkWriter, feedbackCtrl.deleteFeedback)
feedback.use('/:feedbackId/reply', reply)

export default feedback
