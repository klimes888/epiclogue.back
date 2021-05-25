import mongoose from 'mongoose'

const { ObjectId } = mongoose

const report = new mongoose.Schema({
  reportType: { type: Number, required: true },
  /* this content may contain
  0: spam
  1: 18+
  2: disgusting
  3: too violent
  4: negative contentns
  5: causing dispute
  6: illegal contents
  7: copyright
  */
  reporterId: { type: ObjectId, ref: 'User' },
  // reportBody is in copyright report only
  reportBody: {
    reporterName: { type: String },
    reportCompany: { type: String },
    tel: { type: String },
    reporterEmail: { type: String },
    reporterCountry: { type: String },
    originLink: { type: [String] },
    contentSubject: { type: String },
    isAgreePolicy: { type: Boolean },
    isAgreeCorrect: { type: Boolean },
    signature: {type: String },
  },
  suspectUserId: { type: ObjectId, ref: 'User' },
  contentId: { type: ObjectId, refPath: 'contentType' },
  contentType: { type: String, enum: ['Board', 'Feedback', 'Reply'] },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('report', report)
