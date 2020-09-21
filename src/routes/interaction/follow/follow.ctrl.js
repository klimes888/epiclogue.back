import { User, Follow } from '../../../models'
/* 
  This is follow router.
  base url: /:screenId/follow
*/

export const addFollow = async (req, res, next) => {
  const followData = {
    userId: res.locals.uid,
    targetUserId: req.body.targetUserId,
  }

  /* 유저 검증 필요(존재 유무, 플텍 계정의 경우 팔로우 승인 과정 필요) */

  try {
    const validUserCheck = await User.getById(followData.targetUserId)
    if (validUserCheck !== null) {
      await Follow.follow(followData)
      await User.countFollowing(followData.userId, 1)
      await User.countFollower(followData.targetUserId, 1)
      console.log(`[INFO] 유저 ${res.locals.uid}가 ${followData.targetUserId}를 팔로우합니다.`)
      return res.status(201).json({
        result: 'ok',
      })
    } else {
      return res.status(404).json({
        result: 'error',
        message: '존재하지 않는 유저입니다.',
      })
    }
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}

export const deleteFollow = async (req, res, next) => {
  const followData = {
    userId: res.locals.uid,
    targetUserId: req.body.targetUserId,
  }

  /* 유저 검증 필요(존재 유무, 플텍 계정의 경우 팔로우 승인 과정 필요) */

  try {
    const unfollow = await Follow.unfollow(followData)
    await User.countFollowing(followData.userId, 0)
    await User.countFollower(followData.targetUserId, 0)
    if (unfollow.ok === 1) {
      console.log(`[INFO] 유저 ${res.locals.uid}가 ${followData.targetUserId}를 언팔로우했습니다.`)
      return res.status(200).json({
        result: 'ok',
      })
    } else if (unfollow.ok === 0) {
      console.log(
        `[INFO] 유저 ${res.locals.uid}가 ${followData.targetUserId}의 언팔로우를 시도했으나 실패했습니다.`
      )
      return res.status(404).json({
        result: 'error',
        message: '존재하지 않는 유저에게 접근했습니다.',
      })
    }
  } catch (e) {
    console.error(`[Error] ${e.message}`)
    return res.status(500).json({
      result: 'error',
      message: '알 수 없는 오류가 발생했습니다.',
    })
  }
}

export const getFollow = async (req, res, next) => {
  const screenId = req.query.screenId
  const type = req.query.type
  const userId = await User.getIdByScreenId(screenId)
  const dataSet = []
  
  try {
    const followList = type === 'following' ? await Follow.getFollowingList(userId) : await Follow.getFollowerList(userId)
    for (let data of followList) {
      let temp = await Users.getUserInfo(data.targetUserId, {
        nickname: 1,
        userid: 1,
      })
      dataSet.push(temp)
    }
    console.log(`[INFO] 유저 ${res.locals.uid} 가 ${userId} 의 ${type} 리스트를 확인합니다.`)
    return res.status(200).json({
      result: 'ok',
      data: dataSet,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}
