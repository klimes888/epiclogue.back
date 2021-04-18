import '../env/env'
import mongoose from 'mongoose'
import { dbOption } from '../options/options'
import { logger } from '../configs/winston'

mongoose.Promise = global.Promise

export const connectDatabase = async () => {
  const dbUrl =
    process.env.NODE_ENV === 'test' ? process.env.MONGO_TEST_URI : process.env.MONGO_URI_ALONE

  try {
    await mongoose.connect(dbUrl, dbOption)
    console.log(`[MongoDBConnect] Successfully connected database server.`)
  } catch (e) {
    logger.error(`[MongoConnectError] ${e}`)
  }
}

export const disconnectDatabase = async () => {
  // mongoose ready state
  // 0: diconnected, 1: connected, 2: connecting, 3: disconnecting
  if (mongoose.Connection.readyState !== 0) {
    try {
      await mongoose.disconnect()
      console.log('[MongoDB] Database disconnected successfully')
    } catch (e) {
      logger.error(`[MongoDBError] ${e}`)
    }
  } else {
    logger.warn(
      "[MongoDBDisconnectException] Disconnecting database requested while there's no connection"
    )
  }
}

export const dropDatabase = async () => {
  try {
    await mongoose.connection.db.dropDatabase()
    console.log('[MongoDBDropDatabase] Database dropped successfully')
  } catch (e) {
    logger.error(`[DropDatabaseError] ${e}`)
  }
}
