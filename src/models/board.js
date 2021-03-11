import mongoose from 'mongoose'

const { ObjectId } = mongoose

const board = new mongoose.Schema({
  writer: { type: ObjectId, ref: 'User' },
  boardTitle: { type: String, default: '' },
  thumbnail: { type: String },
  boardImg: { type: [String], required: true },
  boardBody: { type: String, default: '' },
  category: { type: String, enum: [0, 1], default: 0 }, // [on future] 0: Illust, 1: Comic
  pub: { type: Number, enum: [0, 1], default: 1 }, // 0: private, 1: public
  writeDate: { type: Date, default: Date.now },
  language: { type: String, default: 0 }, // [on future] 0: Korean, 1: Japanese, 2: US, 3: China, 4: Taiwan
  allowSecondaryCreation: { type: Number, default: 1 }, // 0: not allow, 1: allow, 2: only allow on followers
  tags: { type: [String] },
  originUserId: { type: ObjectId, ref: 'User' },
  originBoardId: { type: ObjectId, ref: 'Board' },
  edited: { type: Boolean, default: false },
  sourceUrl: { type: String, default: null },
})

export default mongoose.model('Board', board)
