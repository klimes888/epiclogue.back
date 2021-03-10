import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dotenvExpand from 'dotenv-expand';
import { dbOption } from './options'

dotenvExpand(dotenv.config());

mongoose.Promise = global.Promise;

export const connect = async () => {
    const dbEnvironment =
      process.env.NODE_ENV === 'test' ? process.env.MONGO_TEST_URI : process.env.MONGO_URI_ALONE;

    try {
      await mongoose.connect(dbEnvironment, dbOption);
      console.log('[INFO] Database connected properly');
    } catch (e) {
      console.error(e);
    }
  }

export const disconnect = async () => {
    // mongoose ready state
    // 0: diconnected, 1: connected, 2: connecting, 3: disconnecting
    if (mongoose.Connection.readyState !== 0) {
      try {
        await mongoose.disconnect();
        console.log('[INFO] Database disconnected properly');
      } catch (e) {
        console.error(e);
      }
    } else {
      console.warn("[WARN] Disconnecting database requested while there's no connection");
    }
  }

export const drop = async () => {
    try {
      await mongoose.connection.db.dropDatabase();
      console.log('[INFO] Test DB dropped');
    } catch (e) {
      console.error(e);
    }
  }
