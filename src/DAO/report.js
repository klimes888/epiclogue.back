import { Report } from '../models'

export const create = function (data) {
  const reportData = new Report(data)
  return reportData.save()
}

export const onProcess = function (reportId) {
  return Report.updateOne({ _id: reportId }, { reportStatus: 1 })
}

export const accepted = function (reportId) {
  return Report.updateOne({ _id: reportId }, { reportStatus: 2 })
}

export const rejected = function (reportId) {
  return Report.updateOne({ _id: reportId }, { reportStatus: 3 })
}
