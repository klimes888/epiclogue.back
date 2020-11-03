'use strict'

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import dotenvExpand from 'dotenv-expand'
dotenvExpand(dotenv.config())

mongoose.Promise = global.Promise

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}

class Database {
  constructor() {}

  async connect() {
    const dbEnvironment =
      process.env.NODE_ENV === 'test' ? process.env.MONGO_TEST_URI : process.env.MONGO_URI

    console.log(`
    ********************************
      Database.connect() called: 
      ${process.env.MONGO_URI}
      ${process.env.MONGO_TEST_URI}
    ********************************`)

    try {
      await mongoose.connect(dbEnvironment, options)
      console.log('[INFO] Database connected properly')
    } catch (e) {
      console.error(e)
    }
  }

  async disconnect() {
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
      console.warn('[WARN] Disconnecting database requested while there\'s no connection')
    }
  }

  async drop() {
    try {
      await mongoose.connection.db.dropDatabase()
      console.log('[INFO] Test DB dropped')
    } catch (e) {
      console.error(e)
    }
  }
}

export default new Database()
