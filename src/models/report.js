import mongoose from 'mongoose';

const { ObjectId } = mongoose;

const Report = new mongoose.Schema({
  reportType: { type: Number, required: true },
  /* this content may contain
  0: spam
  1: 18+
  2: disgusting
  3: too violent
  4: negative contentns
  5: causing dispute
  6: illegal contents
  */
  reporterId: { type: ObjectId },
  suspectUserId: { type: ObjectId },
  reportBody: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  link: { type: String },
  reportStatus: { type: Number, default: 0 }, // 0: submitted, 1: processing, 2: accepted, 3: rejected
  contentStatus: { type: Number, default: 0 }, // 0: public, 1: private, 2: deleted
});

Report.statics.create = function (data) {
  const reportData = new this(data);
  return reportData.save();
};

Report.statics.onProcess = function (reportId) {
  return this.updateOne({ _id: reportId }, { reportStatus: 1 });
};

Report.statics.accepted = function (reportId) {
  return this.updateOne({ _id: reportId }, { reportStatus: 2 });
};

Report.statics.rejected = function (reportId) {
  return this.updateOne({ _id: reportId }, { reportStatus: 3 });
};

module.exports = mongoose.model('Report', Report);
