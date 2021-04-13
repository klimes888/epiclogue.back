import '../env/env'
import redis from 'redis'
import { promisify } from 'util'

const { REDIS_URL } = process.env

const redisClient = redis.createClient({
  url: REDIS_URL,
})

redisClient.on('connect', () => {
  console.log(`[INFO] Successfully connected cache server ${REDIS_URL}`)
})

redisClient.on('error', err => {
  console.error(err)
  process.exit(1)
})

export default {
  ...redisClient,
  getAsync: promisify(redisClient.get).bind(redisClient),
  setAsync: promisify(redisClient.set).bind(redisClient),
}
