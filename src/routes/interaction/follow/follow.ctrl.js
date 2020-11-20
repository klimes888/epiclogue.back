import { User, Follow } from '../../../models'
import createError from 'http-errors'
import { startSession } from 'mongoose'

/* 
  This is follow router.
  base url: /interaction/follow[?screenId=lunarcat123&type=following]
  OPTIONS: [GET / POST / DELETE]
*/

export const addFollow = async (req, res, next) => {
  const followData = {
    userId: res.locals.uid,
    targetUserId: req.body.targetUserId,
  }

  const session = await startSession()

  try {
    const didFollow = await Follow.didFollow(followData)

    if (didFollow) {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 이미 팔로우 한 ${followData.targetUserId} 에 팔로우를 요청했습니다.`
      )
      return next(createError(400, '이미 처리된 데이터입니다.'))
    }
    await session.withTransaction(async () => {
      const followSchema = new Follow(followData)
      await followSchema.save({ session })
      await User.countFollowing(followData.userId, 1).session(session)
      await User.countFollower(followData.targetUserId, 1).session(session)

      console.log(`[INFO] 유저 ${res.locals.uid}가 ${followData.targetUserId}를 팔로우합니다.`)
      return res.status(201).json({
        result: 'ok',
      })
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  } finally {
    session.endSession()
  }
}

export const deleteFollow = async (req, res, next) => {
  const followData = {
    userId: res.locals.uid,
    targetUserId: req.body.targetUserId,
  }

  const session = await startSession()

  try {
    const didFollow = await Follow.didFollow(followData)

    if (!didFollow) {
      console.log(
        `[INFO] 유저 ${res.locals.uid} 가 팔로우 하지않은 ${followData.targetUserId} 에 팔로우를 요청했습니다.`
      )
      return next(createError(400, '이미 처리된 데이터입니다.'))
    }

    await session.withTransaction(async () => {
      const unfollow = await Follow.unfollow(followData).session(session)

      await User.countFollowing(followData.userId, 0).session(session)
      await User.countFollower(followData.targetUserId, 0).session(session)

      if (unfollow.ok === 1) {
        console.log(
          `[INFO] 유저 ${res.locals.uid}가 ${followData.targetUserId}를 언팔로우했습니다.`
        )
        return res.status(200).json({
          result: 'ok',
        })
      } else if (unfollow.ok === 0) {
        console.error(
          `[ERROR] 유저 ${res.locals.uid}가 ${followData.targetUserId}에게 한 언팔로우가 실패했습니다: 데이터베이스 질의에 실패했습니다.`
        )
        return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
      }
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  } finally {
    session.endSession()
  }
}

export const getFollow = async (req, res, next) => {
  const screenId = req.query.screenId
  const userId = await User.getIdByScreenId(screenId)
  const type = req.query.type

  try {
    const followingList = await Follow.find({ userId: res.locals.uid })
    const followingIdSet = followingList.map(each => {
      return each.targetUserId.toString()
    })
    const followerList = await Follow.find({ targetUserId: res.locals.uid })
    const followerIdSet = followerList.map(each => {
      return each.userId.toString()
    })

    const resultSet = []
    if (type === 'following') {
      const _requestedData = await Follow.getFollowingList(userId._id)
      const requestedData = _requestedData.filter(data => {
        return data._id !== null
      })
      for (let eachData of requestedData) {
        eachData = eachData.toJSON()
        if (eachData.targetUserId._id.toString() === res.locals.uid) {
          eachData.targetUserId.following = 'me'
          eachData.targetUserId.follower = 'me'
        } else {
          eachData.targetUserId.following = followingIdSet.includes(eachData.targetUserId._id.toString()) ? true : false
          eachData.targetUserId.follower = followerIdSet.includes(eachData.targetUserId._id.toString()) ? true : false
        }
        resultSet.push(eachData.targetUserId)
      }
    } else if (type === 'follower') {
      const _requestedData = await Follow.getFollowerList(userId._id)
      const requestedData = _requestedData.filter(data => {
        return data._id !== null
      })
      for (let eachData of requestedData) {
        eachData = eachData.toJSON()
        if (eachData.userId._id.toString() === res.locals.uid) {
          eachData.userId.following = 'me'
          eachData.userId.follower = 'me'
        } else {
          eachData.userId.following = followingIdSet.includes(eachData.userId._id.toString()) ? true : false
          eachData.userId.follower = followerIdSet.includes(eachData.userId._id.toString()) ? true : false
        }
        resultSet.push(eachData.userId)
      }
    }

    console.log(`[INFO] 유저 ${res.locals.uid} 가 ${userId._id} 의 ${type} 리스트를 확인합니다.`)
    return res.status(200).json({
      result: 'ok',
      data: resultSet,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}
