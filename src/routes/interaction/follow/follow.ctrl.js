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

export const getFollowing = async (req, res, next) => {
  const screenId = req.params.screenId
  const userId = await User.getIdByScreenId(screenId)
  console.log(userId)
  const followingDataSet = []
  try {
    const followingList = await Follow.getFollowingList(userId)
    for (let data of followingList) {
      let temp = await Users.getUserInfo(data.targetUserId, {
        nickname: 1,
        userid: 1,
      })
      followingDataSet.push(temp)
    }
    return res.status(200).json({
      result: 'ok',
      data: followingDataSet,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}

export const getFollower = async (req, res, next) => {
  const screenId = req.params.screenId
  const userId = await User.getIdByScreenId(screenId)
  const followerDataSet = []
  try {
    const followerList = await Follow.getFollowerList(userId)
    for (let data of followerList) {
      let temp = await Users.getUserInfo(data.targetUserId, {
        nickname: 1,
        userid: 1,
      })
      followerDataSet.push(temp)
    }
    return res.status(200).json({
      result: 'ok',
      data: followerDataSet,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}
