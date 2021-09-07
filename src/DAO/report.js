import { startSession } from 'mongoose'
import { Report, ReportLog } from '../models'

export const create = function (data) {
  return Report.create(data)
}

export const getReportGroupBy = function (page = 0, size = 20, isCopyright = false) {
  return Report.aggregate([
    {
      $match: {
        reportBody: isCopyright ? { $ne: null } : null,
      },
    },
    {
      $group: {
        _id: '$contentId',
        _suspectUserId: { $first: '$suspectUserId' },
        _contentType: { $first: '$contentType' },
        _createdAt: { $last: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    {
      $skip: page * size,
    },
    {
      $limit: size,
    },
    {
      $lookup: {
        from: 'users',
        let: { suspectUserId: '$_suspectUserId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$suspectUserId'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              deactivatedAt: 1,
              screenId: 1,
            },
          },
        ],
        as: 'suspectUserInfo',
      },
    },
    {
      $sort: {
        _createdAt: -1,
        count: 1,
      },
    },
  ])
}

export const getReports = function (contentId, contentType, isCopyright) {
  return Report.find({ contentId, contentType, reportBody: isCopyright ? { $ne: null } : null })
    .populate({
      path: 'reporterId',
      select: '_id screenId nickname profile',
    })
    .populate({
      path: 'suspectUserId',
      select: '_id screenId nickname profile',
    })
    .populate({
      path: 'contentId',
      select: '_id boardTitle feedbackBody replyBody',
    })
}

export const getReportLogs = function (size = 30, page, isCopyright) {
  return ReportLog.find({isCopyright}).skip(page*30).limit(size)
}

export const deleteProcessedReport = async function (contentId, contentType, reportType, reportStatus, contentStatus, isCopyright) {
  const session = await startSession()
  try {
    await ReportLog.create([{contentId, contentType, reportType, reportStatus, contentStatus, isCopyright}], { session })
    await Report.deleteMany({
      contentId
    }).session(session)
  } catch (e) {
    throw new Error(`Error in Report Transaction ${e}`)
  } finally {
    session.endSession()
  }
}
