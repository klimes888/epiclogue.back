import { startSession } from 'mongoose'
import { Report, ReportLog } from '../models'

export const create = function (data) {
  return Report.create(data)
}

export const getReportGroupBy = function () {
  return Report.aggregate([
    {
      $match:
        {
          reportBody: { "$exists": false }
        }
    },
    {
      $group:
        {
          _id: "$contentId",
          _suspectUserId: { "$first": "$suspectUserId" },
          _contentType: { "$first": "$contentType" },
          _createdAt: { "$last": "$createdAt" },
          count: { "$sum": 1 }
        }
    },
    {
      $lookup:
        {
          from: "users",
          localField: "_suspectUserId",
          foreignField: "_id",
          as: "suspactUserInfo"
        }
    },
    {
      $sort:
        {
          _createdAt: -1,
          count: 1,
        }
    }
  ])
}

export const getReports = function (contentId, contentType, isCopyright) {
  return Report.find({contentId, contentType, reportBody: { $exists: isCopyright }})
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
    select: '_id boardTitle feedbackBody replyBody'
  })
}

export const getReportLogs = function (size = 30, page) {
  return ReportLog.find().skip(page*30).limit(size)
}

export const deleteProcessedReport = async function (reportData) {
  const session = await startSession()
  try {
    await ReportLog.create([reportData], { session })
    await Report.deleteMany({
      contentId: reportData.contentId
    }).session(session)
  } catch(e) {
    throw new Error(`Error in Report Transaction ${e}`)
  } finally {
    session.endSession()
  }
}
