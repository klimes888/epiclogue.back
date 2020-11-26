import * as models from '../../models'
import createError from 'http-errors'
import { getBookmarkList } from '../interaction/bookmark/bookmark.ctrl'
import { contentsWrapper } from '../../lib/contentsWrapper'

export const getMyboard = async (req, res, next) => {
  const userId = await models.User.findOne({ screenId: req.params.screenId })
  try {
    let result = await models.User.getUserInfo(userId, {
      nickname: 1,
      intro: 1,
      screenId: 1,
      banner: 1,
      profile: 1,
      followerCount: 1,
      followingCount: 1,
      joinDate: 1
    })

    result = result.toJSON()

    if (res.locals.uid === result._id.toString()) {
      result.isFollowing = 'me'
    } else {
      const isFollowing = await models.Follow.findOne({ userId: res.locals.uid, targetUserId: userId })
      // const isFollower = await models.Follow.findOne({ userId: userId, targetUserId: res.locals.uid })
      if (isFollowing) {
        result.isFollowing = true
      } else {
        result.isFollowing = false
      }
      // if (isFollower) {
      //   result.isFollower = true
      // } else {
      //   result.isFollower = false
      // }
    }

    return res.status(200).json({
      result: 'ok',
      data: result,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 오류가 발생했습니다.'))
  }
}

export const allWorks = async (req, res, next) => {
  const userId = await models.User.findOne(
    { screenId: req.params.screenId },
    { _id: 1, screenId: 0 }
  )
  try {
    const allWorks = await models.Board.find({ writer: userId }).populate({
      path: 'writer',
      select: '_id screenId nickname profile',
    })
    const wrappedWorks = await contentsWrapper(allWorks)

    console.log(`[INFO] ${res.locals.uid} 가 ${userId._id} 의 글들을 확인합니다.`)
    return res.status(200).json({
      result: 'ok',
      data: wrappedWorks,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    next(createError(500, '알 수 없는 오류가 발생했습니다.'))
  }
}

export const originals = async (req, res, next) => {
  try {
    const targetUser = await models.User.findOne({ screenId: req.params.screenId }, { _id: 1 })
    const myContents = await models.Board.findAll({ writer: targetUser._id })
    const wrappedContents = await contentsWrapper(res.locals.uid, myContents, 'Board', false)

    console.log(`[INFO] 유저 ${res.locals.uid} 가 유저 ${targetUser._id} 의 원작들을 확인합니다.`)
    return res.status(200).json({
      result: 'ok',
      data: wrappedContents,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

export const secondaryWorks = async (req, res, next) => {
  try {
    const targetUser = await models.User.findOne({ screenId: req.params.screenId }, { _id: 1 })
    const secondaryWorks = await models.Board.findAllSecondaryWorks( targetUser._id )
    const wrappedContents = await contentsWrapper(res.locals.uid, secondaryWorks, 'Board', false)

    console.log(`[INFO] 유저 ${res.locals.uid} 가 유저 ${targetUser._id} 의 2차창작들을 확인합니다.`)
    return res.status(200).json({
      result: 'ok',
      data: wrappedContents,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

export const bookmarks = (req, res, next) => {
  return getBookmarkList(req, res, next)
}
