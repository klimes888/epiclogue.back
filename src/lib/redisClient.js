import '../env/env'
import dayjs from 'dayjs'
import redis from 'redis'
import { promisify } from 'util'
import { logger } from '../configs/winston'

const redisClient = redis.createClient({
  url: process.env.NODE_ENV === 'test' ? process.env.REDIS_TEST_URL : process.env.REDIS_URL,
})

redisClient.on('connect', () => {
  console.log(`[RedisConnect] Successfully connected cache server`)
})

redisClient.on('error', err => {
  logger.error(`[RedisError] ${dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss Z')} ${err}`)
})

/**
 * Get/Set
 *  K: req.session.id
 *  V: JSON.stringify({ userObjectId, isMember, accessCount, accessToken })
 */
export default {
  getClient: redisClient,
  getAsync: promisify(redisClient.get).bind(redisClient),
  // setAsync: promisify(redisClient.set).bind(redisClient),
  /**
   * setWithTtl: 세션을 1시간동안 유지하고 재요청시 1시간으로 갱신.
   * 사용방법: setWithTtl(key, time(s), value)
   */
  setWithTtl: promisify(redisClient.setex).bind(redisClient),
  flushAll: promisify(redisClient.flushall).bind(redisClient),
}
