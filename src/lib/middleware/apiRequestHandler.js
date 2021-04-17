import redisClient from '../redisClient'
import { verifyToken } from '../tokenManager'
import { apiRequestLogger } from './apiRequestLogger'

/**
 *  요청한 클라이언트의 데이터를 express.Request 객체에 내재화하고
 *  세션에 따라 캐싱하는 미들웨어
 */
export const apiRequestHandler = async (req, res, next) => {
  const userSessionId = req.session.id
  const userCache = await redisClient.getAsync(userSessionId)
  const accessToken = req.cookies?.access_token

  if (userCache) {
    // 캐시된 세션이 있을 경우
    /**
     * userCacheValue = {
     *    isMember, // 멤버 여부
     *    accessCount,  // 해당 세션을 가지고 요청한 수
     *    (optional) id,  // 회원일 경우 Unique ID
     *    (optional) accessToken  // 회원일 경우 요청한 access_token
     * }
     */
    const userCacheValue = JSON.parse(userCache)
    if (accessToken) {
      const decodedToken = await verifyToken(accessToken)
      if (decodedToken) {
        // 캐싱된 세션 + 정상적인 토큰 = 회원 유저의 다회 접근
        userCacheValue.accessCount += 1
        // 요청 데이터 내재화
        res.locals.uid = userCache.userId
      } else {
        // 캐싱된 세션(1h 이내) + 손상된 토큰 = 비회원 유저로 처리
        userCacheValue.accessCount += 1
        userCacheValue.accessToken = req.cookies.accessToken
        userCacheValue.isMember = false
        userCacheValue.id = null
      }
    } else {
      // 캐싱된 세션이 있지만 토큰은 없다 = 비회원 유저의 다회 접근
      userCacheValue.accessCount += 1
    }
    redisClient.setWithTtl(userSessionId, 3600, JSON.stringify(userCacheValue))
    req.user = userCacheValue
  } else {
    // 캐시된 세션이 없는 경우
    const userData = {
      isMember: false,
      accessCount: 1,
    }
    if (accessToken) {
      // 캐싱된 세션은 없으나 토큰은 있다 = 만료된 세션(추정)을 가진 회원
      userData.accessToken = accessToken
      const decodedToken = await verifyToken(accessToken)
      if (decodedToken) {
        userData.isMember = true
        userData.id = decodedToken.uid
      }
    }
    // else {
    //   // 캐싱된 세션도 없고 토큰도 없다 = 비회원 유저의 최초 접근. 아무것도 하지 않음.
    // }
    redisClient.setWithTtl(req.session.id, 3600, JSON.stringify(userData))
    req.user = userData
  }
  apiRequestLogger(req, res, next)
  next()
}
