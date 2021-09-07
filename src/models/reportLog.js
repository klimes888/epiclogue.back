import mongoose from 'mongoose'

const { ObjectId } = mongoose
// Log 모델은 상위 report 모델에 대한 처리가 이루어졌을때만 기록됨
// EX) 삭제, 반려, 비공개 등등
const reportLog = new mongoose.Schema({
    contentId: { type: ObjectId, refPath: 'contentType' },
    contentType: { type: String, enum: ['Board', 'Feedback', 'Reply']},
    reportType: { type: Number },
    reportStatus: { type: Number }, // 0: delete, 1: stop, 2: unsign, 3: reject
    contentStatus: { type: Number }, // 0: delete, 1: private, 2: public
    isCopyright: { type: Boolean },
    closedAt: { type: Date, default: Date.now},
    closedBy: { type: ObjectId, default: null, ref: 'User' }
})

export default mongoose.model('reportlog', reportLog)
