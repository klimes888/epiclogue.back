import { reportDAO, userDAO, boardDAO, replyDAO, feedbackDAO, notificationDAO } from '../../DAO'
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
        data = await reportDAO.getReportLogs(size, page, req.query.isCopyright)
    } catch(e) {
        return next(apiErrorGenerator(500, 'error get reportLog'))
    }

    return apiResponser({req, res, statusCode: 201, data, message: 'success get reportLog'})
    
}

export const deleteReportAndCreateLog = async (req, res, next) => {
    const { contentId, contentType, reportType, reportStatus, suspectUserId, isCopyright } = req.body
    const parsedReportStatus = await parseIntParam(reportStatus, 3)
    let data
    try {
        const result = await processReport(contentId, contentType, parsedReportStatus, suspectUserId)
        result.reportType = reportType
        console.log(result)
        data = await reportDAO.deleteProcessedReport(contentId, contentType, reportType, parsedReportStatus, result.contentStatus, isCopyright)
            await notificationDAO.makeNotification({
              targetUserId: suspectUserId,
              maker: req.user.id,
              notificationType: 'Notice',
              targetType: contentType,
              targetInfo: contentId,
              message: result
            })
    } catch(e) {
        return next(apiErrorGenerator(500, 'error when delete report and create report log', e))
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
    console.log(req.body.reportBody)
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

const processReport = async (contentId, contentType, reportStatus, suspectUserId) => {
    const result = {
        status: reportStatus
    }
    let data = ''
    try {
        if (reportStatus === 0) {
            switch (contentType) {
                case 'Board':
                    data = await boardDAO.deleteBoard(contentId)
                    break
                case 'Feedback':
                    data = await feedbackDAO.deleteById(contentId)
                    break
                case 'Reply':
                    data = await replyDAO.deleteById(contentId)
                    break
                default:
                    data = 'content type is incorrect'
                    break
            }
            console.log(data)
            result.data = data
            result.message =  `컨텐츠 ${data} 삭제처리 됨`
            result.contentStatus = 0
        } else if (reportStatus === 1 || reportStatus === 2) {
            switch (contentType) {
                case 'Board':
                    data = await boardDAO.setBlind(contentId)
                    break
                case 'Feedback':
                    data = await feedbackDAO.setBlind(contentId)
                    break
                case 'Reply':
                    data = await replyDAO.setBlind(contentId)
                    break
                default:
                    break
            }
            result.data = data
            result.userData = reportStatus === 1 ? await userDAO.deactiveUser(suspectUserId) : await userDAO.deleteUser(suspectUserId)
            result.message = `회원 ${reportStatus === 1 ? '정지' : '탈퇴'}처리 및 컨텐츠 ${data} 비공개처리 완료`
            result.contentStatus = 1
        } else {
            result.data = null
            result.message = '처리 반려됨'
            result.contentStatus = 2
        }
    } catch (e) {
        throw new Error(`error in report processing ${e}`)
    }

    return result
}

export const unsetBlind = async (contentId, contentType) => {
    const result = {

    }
    switch (contentType) {
        case 'Board':
            result.data = await boardDAO.unsetBlind(contentId)
            break
        case 'Feedback':
            result.data = await feedbackDAO.unsetBlind(contentId)
            break
        case 'Reply':
            result.data = await replyDAO.unsetBlind(contentId)
            break
        default:
            break
    }
}