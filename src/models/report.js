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

export default mongoose.model('Report', Report);
