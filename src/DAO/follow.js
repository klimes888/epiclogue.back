import { startSession } from 'mongoose'
import { Follow } from '../models'

export const follow = async function (followData) {
    let followCount;
    const session = await startSession();
    try {
        await session.withTransaction(async () => {
            await Follow.create([followData],{ session });
            followCount = await Follow.countDocuments({
                targetUserId: followData.targetUserId,
            }).session(session);
        });
    } catch(e) {
        throw new Error(`Error in Follow Transaction ${e}`);
    } finally {
        session.endSession();
    }
    return followCount;
  };
  
export const unfollow = async function (unFollowData) {
    let followCount;
    const session = await startSession();
    try {
        await session.withTransaction(async () => {
            await Follow.deleteOne({
              userId: unFollowData.userId,
              targetUserId: unFollowData.targetUserId,
            }).session(session);
            followCount = await Follow.countDocuments({
              targetUserId: unFollowData.targetUserId,
            }).session(session);
          });
    } catch(e) {
        throw new Error(`Error in Follow Transaction ${e}`);
    } finally {
        session.endSession();
    }

    return followCount;
  };
  
export const didFollow = async function ({ userId, targetUserId }, session) {
    const isFollowing = await Follow.findOne({ userId, targetUserId }, {}, { session });
    if (isFollowing) {
      return true;
    }
    return false;
  };
  
  // 유저의 팔로잉 목록
export const getFollowingList = function (userId) {
    return Follow.find({ userId }, { _id: 0, userId: 0, __v: 0 }).populate({
      path: 'targetUserId',
      select: '_id screenId nickname profile',
    });
  };
  
export const getFollowingIdList = function (userId) {
    return Follow.find({ userId }, { targetUserId: 1 });
  };
  
  // 유저의 팔로워 목록
export const getFollowerList = function (targetUserId) {
    return Follow.find({ targetUserId }, { _id: 0, targetUserId: 0, __v: 0 }).populate({
      path: 'userId',
      select: '_id screenId nickname profile',
    });
  };
  
export const getFollowerIdList = function (targetUserId) {
    return Follow.find({ targetUserId }, { userId: 1 });
  };
  
export const isFollowing = function (userId, targetUserId) {
    return Follow.findOne({ userId, targetUserId });
  };

export const getFollowerCount = async (targetUserId) => Follow.countDocuments({ targetUserId })

export const getFollowingCount = async ( userId ) => Follow.countDocuments({ userId })