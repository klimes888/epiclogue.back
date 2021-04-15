import '../env/env'
import mongoose from 'mongoose'
import { dbOption } from '../options/options'

mongoose.Promise = global.Promise

export const connectDatabase = async () => {
  const dbUrl =
    process.env.NODE_ENV === 'test' ? process.env.MONGO_TEST_URI : process.env.MONGO_URI_ALONE

  try {
    await mongoose.connect(dbUrl, dbOption)
    console.log(`[INFO] Successfully connected database server ${dbUrl}`)
  } catch (e) {
    console.error(e)
  }
}

export const disconnectDatabase = async () => {
  // mongoose ready state
  // 0: diconnected, 1: connected, 2: connecting, 3: disconnecting
  if (mongoose.Connection.readyState !== 0) {
    try {
      await mongoose.disconnect()
      console.log('[INFO] Database disconnected properly')
    } catch (e) {
      console.error(e)
    }
  } else {
    console.warn("[WARN] Disconnecting database requested while there's no connection")
  }
}

export const dropDatabase = async () => {
  try {
    await mongoose.connection.db.dropDatabase()
    console.log('[INFO] Test DB dropped')
  } catch (e) {
    console.error(e)
  }
}
