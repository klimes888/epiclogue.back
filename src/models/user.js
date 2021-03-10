import mongoose from 'mongoose'

const userImageSchema = {
  origin: { type: String, default: null },
  thumbnail: { type: String, default: null },
}

const user = new mongoose.Schema({
  nickname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  screenId: { type: String },
  displayLanguage: { type: Number, default: 0 }, // 0: Korean, 1: Japanese, 2: English, 3: Chinese(Simplified), 4: Chinese(Traditional)
  availableLanguage: { type: [String] },
  joinDate: { type: Date, required: true, default: Date.now },
  deactivatedAt: { type: Date, default: null },
  termsOfUseAcceptedAt: { type: Date, required: true, default: Date.now },
  intro: { type: String, default: null },
  banner: userImageSchema,
  profile: userImageSchema,
  salt: { type: String },
  isConfirmed: { type: Boolean, required: true, default: false },
  token: { type: String },
  snsId: { type: String },
  snsType: { type: String, default: 'normal' },
})

export default mongoose.model('User', user)
