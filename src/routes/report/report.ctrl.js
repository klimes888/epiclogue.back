import { reportDAO } from '../../DAO'
import { apiErrorGenerator } from '../../lib/apiErrorGenerator'
import { apiResponser } from '../../lib/middleware/apiResponser'
import { parseIntParam } from '../../lib/parseParams'

export const getReportGroupBy = async (req, res, next) => {
    let result
    try {
        result = await reportDAO.getReportGroupBy()
    } catch(e) {
        return next(apiErrorGenerator(500, 'failed get reports group', e))
    }

    return apiResponser(req, res, 201, result, 'get report group seccess')

}

export const getReports = async (req, res, next) => {
    const { contentId, contentType, isCopyright } = req.query
    let result
    try {
        result = await reportDAO.getReports(contentId, contentType, isCopyright)
    } catch(e) {
        return next(apiErrorGenerator(500, 'error get reports', e))
    }

    return apiResponser(req, res, 201, result, 'success get reports')
}

export const getReportLogs = async (req, res, next) => {
    const size = await parseIntParam(req.query.size, 20)
    const page = await parseIntParam(req.query.page, 20)
    let result
    try{
        result = await reportDAO.getReportLogs(size, page)
    } catch(e) {
        return next(apiErrorGenerator(500, 'error get reportLog'))
    }

    return apiResponser(req, res, 201, result, 'success get reportLog')
    
}

export const deleteReportAndCreateLog = async (req, res, next) => {
    const { reportData } = req.body
    let result
    try {
        result = await reportDAO.deleteProcessedReport(reportData)
    } catch(e) {
        return next(apiErrorGenerator(500, 'error delete report and create report log', e))
    }
    
    return apiResponser(req, res, 201, result, 'success delete and create log')
}

export const postReport = async (req, res, next) => {
    const reportData = {
        reportType: req.body.reportType,
        reporterId: req.user.id,
        suspectUserId: req.body.suspectUserId,
        contentId: req.body.contentId,
        contentType: req.body.contentType
    }
    try {
        await reportDAO.create(reportData)
    } catch(e) {
        return next(apiErrorGenerator(500, 'report create Error', e))
    }

    return apiResponser(req, res, 201, reportData, 'success')
}