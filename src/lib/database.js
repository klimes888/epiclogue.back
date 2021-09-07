import '../env/env'
import mongoose from 'mongoose'
import dayjs from 'dayjs'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

import { dbOption } from '../options/options'
import { logger } from '../configs/winston'

mongoose.Promise = global.Promise

export const connectDatabase = async () => {
  let dbUrl = process.env.MONGO_URI_ALONE

  if (process.env.NODE_ENV === 'test') {
    const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } })
    dbUrl = replSet.getUri()
  }

  try {
    await mongoose.connect(dbUrl, dbOption)
    console.log(
      `[MongoDBConnect] Successfully connected ${process.env._NODE_ENV} database server ${dbUrl}`
    )
  } catch (e) {
    logger.error(`[MongoDBConnectError] ${dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss Z')} ${e}`)
  }
}

export const disconnectDatabase = async () => {
  // mongoose ready state
  // 0: diconnected, 1: connected, 2: connecting, 3: disconnecting
  if (mongoose.Connection.readyState !== 0) {
    try {
      await mongoose.disconnect()
      console.log('[MongoDBDisconnect] Database disconnected successfully')
    } catch (e) {
      logger.error(`[MongoDBError] ${dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss Z')} ${e}`)
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
    console.log(`[MongoDBDropDatabase] ${process.env._NODE_ENV} database dropped successfully`)
  } catch (e) {
    logger.error(`[MongoDropDatabaseError] ${dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss Z')} ${e}`)
  }
}
