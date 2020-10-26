import { User, Follow } from '../../../models'
import createError from 'http-errors'

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

  try {
    const didFollow = await Follow.didFollow(followData)
    
    if(didFollow) {
        console.log(`[INFO] 유저 ${res.locals.uid} 가 이미 팔로우 한 ${followData.targetUserId} 에 팔로우를 요청했습니다.`)
        return next(createError(400, '이미 처리된 데이터입니다.'))
    }

    await Follow.follow(followData)
    await User.countFollowing(followData.userId, 1)
    await User.countFollower(followData.targetUserId, 1)

    console.log(`[INFO] 유저 ${res.locals.uid}가 ${followData.targetUserId}를 팔로우합니다.`)
    return res.status(201).json({
      result: 'ok',
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

export const deleteFollow = async (req, res, next) => {
  const followData = {
    userId: res.locals.uid,
    targetUserId: req.body.targetUserId,
  }

  try {
    const didFollow = await Follow.didFollow(followData)
    
    if(!didFollow) {
        console.log(`[INFO] 유저 ${res.locals.uid} 가 팔로우 하지않은 ${followData.targetUserId} 에 팔로우를 요청했습니다.`)
        return next(createError(400, '이미 처리된 데이터입니다.'))
    }

    const unfollow = await Follow.unfollow(followData)

    await User.countFollowing(followData.userId, 0)
    await User.countFollower(followData.targetUserId, 0)

    if (unfollow.ok === 1) {
      console.log(`[INFO] 유저 ${res.locals.uid}가 ${followData.targetUserId}를 언팔로우했습니다.`)
      return res.status(200).json({
        result: 'ok',
      })
    } else if (unfollow.ok === 0) {
      console.error(
        `[ERROR] 유저 ${res.locals.uid}가 ${followData.targetUserId}에게 한 언팔로우가 실패했습니다: 데이터베이스 질의에 실패했습니다.`
      )
      return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
    }
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

export const getFollow = async (req, res, next) => {
  const screenId = req.query.screenId
  const type = req.query.type
  const userId = await User.getIdByScreenId(screenId)
  const dataSet = []

  try {
    const followList =
      type === 'following'
        ? await Follow.getFollowingList(userId._id)
        : await Follow.getFollowerList(userId._id)

    for (let data of followList) {
      let temp = await User.getUserInfo(data.targetUserId, {
        nickname: 1,
        screenId: 1,
        intro: 1,
        profile: 1
      })

      dataSet.push(temp)
    }
    console.log(`[INFO] 유저 ${res.locals.uid} 가 ${userId._id} 의 ${type} 리스트를 확인합니다.`)
    return res.status(200).json({
      result: 'ok',
      data: dataSet,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}
