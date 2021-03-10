import { startSession } from 'mongoose'
import {Bookmark, React} from '../models'

export const create = async (bookmarkData, reactData, boardId) => {
    let bookmarkCount
    const session = await startSession();
    try {
        await session.withTransaction(async () => {
            await Bookmark.create([bookmarkData], { session });
            await React.craete([reactData], { session });
            bookmarkCount = await Bookmark.countDocuments({ board: boardId }).session(
              session
            );
          });
    } catch(e) {
        throw new Error(`Error in Bookmark Transaction ${e}`);
    } finally {
        session.endSession();
    }
    return bookmarkCount
  }
  
export const deleteBookmark = async (user, boardId) => {
    let bookmarkCount;
    const session = await startSession();
    try {
        await session.withTransaction(async () => {
            await Bookmark.deleteOne({user, board: boardId}).session(session);
            await React.deleteOne({user, boardId, type: 'bookmark'}).session(session);
            bookmarkCount = await Bookmark.countDocuments({ board: boardId }).session(session);
          });
    } catch(e) {
        throw new Error(`Error in Bookmark Transaction ${e}`);
    } finally {
        session.endSession();
    }
    return bookmarkCount;
  }
  
export const getIdByUserId = function (userId) {
    return Bookmark.find({ user: userId });
  };
  
  // 유저의 북마크 목록
export const getByUserId = function (user) {
    return Bookmark.find({ user }, { user: 0 }).populate({
      path: 'board',
      select: '_id boardTitle thumbnail pub category',
      populate: { path: 'writer', select: '_id screenId nickname profile' },
    });
  }
  
export const didBookmark = function (user, board) {
    return Bookmark.findOne({ user, board });
  }
  
export const countBookmarks = function (boardId) {
    return Bookmark.countDocuments({ _id: boardId });
  }