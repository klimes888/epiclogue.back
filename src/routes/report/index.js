import express from 'express'
import * as reportCtrl from './report.ctrl'
import { authToken } from '../../lib/middleware/tokenAuth'
import { checkAdmin } from '../../lib/middleware/checkPermission'

const report = express.Router()

report.get('/', authToken, checkAdmin, reportCtrl.getReportGroupBy)
report.get('/processedReports', authToken, checkAdmin, reportCtrl.getReportLogs)
report.get('/submittedReports', authToken, checkAdmin, reportCtrl.getReports)
report.post('/', authToken, reportCtrl.postReport)
report.delete('/', authToken, reportCtrl.deleteReportAndCreateLog)

export default report