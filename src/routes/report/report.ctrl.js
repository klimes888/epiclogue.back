import { reportDAO } from '../../DAO'
import { apiErrorGenerator } from '../../lib/apiErrorGenerator'
import { apiResponser } from '../../lib/middleware/apiResponser'
import { parseIntParam } from '../../lib/parseParams'

export const getReportGroupBy = async (req, res, next) => {
    const size = await parseIntParam(req.query.size, 20)
    const page = await parseIntParam(req.query.page, 0)
    const { isCopyright } = req.query
    let data
    try {
        data = await reportDAO.getReportGroupBy(page, size, isCopyright === 'true')
    } catch(e) {
        return next(apiErrorGenerator(500, 'failed get reports group', e))
    }

    return apiResponser({req, res, statusCode: 201, data, message: 'get report group success'})

}

export const getReports = async (req, res, next) => {
    const { contentId, contentType, isCopyright } = req.query
    let data
    try {
        data = await reportDAO.getReports(contentId, contentType, isCopyright === 'true')
    } catch(e) {
        return next(apiErrorGenerator(500, 'error get reports', e))
    }

    return apiResponser({req, res, statusCode: 201, data, message: 'success get reports'})
}

export const getReportLogs = async (req, res, next) => {
    const size = await parseIntParam(req.query.size, 20)
    const page = await parseIntParam(req.query.page, 20)
    let data
    try{
        data = await reportDAO.getReportLogs(size, page)
    } catch(e) {
        return next(apiErrorGenerator(500, 'error get reportLog'))
    }

    return apiResponser({req, res, statusCode: 201, data, message: 'success get reportLog'})
    
}

export const deleteReportAndCreateLog = async (req, res, next) => {
    const { reportData } = req.body
    let data
    try {
        data = await reportDAO.deleteProcessedReport(reportData)
    } catch(e) {
        return next(apiErrorGenerator(500, 'error delete report and create report log', e))
    }
    
    return apiResponser({req, res, statusCode: 201, data, message: 'success delete and create log'})
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

    return apiResponser({
        req,
        res, 
        statusCode: 201, 
        data: reportData, 
        message: 'success'
    })
}

export const postCopyrightReport = async (req, res, next) => {
    const reportData = {
        reportType: req.body.reportType,
        reporterId: req.user.id,
        suspectUserId: req.body.suspectUserId,
        contentId: req.body.contentId,
        contentType: req.body.contentType,
        reportBody: req.body.reportBody
    }
    try {
        await reportDAO.create(reportData)
    } catch(e) {
        return next(apiErrorGenerator(500, 'report create Error', e))
    }

    return apiResponser({
        req,
        res, 
        statusCode: 201, 
        data: reportData, 
        message: 'success'
    })
}
