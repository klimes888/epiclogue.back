import createError from 'http-errors';
import { Board, Like, Bookmark, React, Follow } from '../models';

/**
 * 유저에 맞는 컨텐츠를 제공하기 위한 래퍼객체
 * @param {string}  reqUserId   - 요청한 유저의 MongoDB ID
 * @param {Array}   contentData - 감싸질 데이터. 뷰어에서 요청했을 경우 Object 타입이어야 한다.
 * @param {string}  contentType     - 컨텐츠의 타입.
 * @param {Boolean} isForViewer - 데이터가 컨텐츠 뷰어에서 사용될 것인지 여부
 */
export const contentsWrapper = async (reqUserId, contentData, contentType, isForViewer) =>
  new Promise(async (resolve, reject) => {
    // 회원/비회원 유저에 관계없이 필요한 데이터: 컨텐츠(글/댓글/대댓글)의 좋아요/리액트/북마크 카운트
    // 회원에게만 필요한 데이터: 해당 컨텐츠(글/댓글/대댓글)의 좋아요/북마크 여부

    if (!contentType) {
      reject(createError(400, '컨텐츠 타입이 존재하지 않습니다.'));
    }

    if (contentData) {
      // MongoDB JSON을 pure JSON 으로 변환
      let targetContent = contentData;
      if (!(contentData instanceof Array)) {
        targetContent = contentData.toJSON();
      }

      let bookmarkIdSet;
      let followingIdSet;
      let likeIdSet;

      // 회원일 경우
      if (reqUserId) {
        bookmarkIdSet = await getBookmarkIdSet(reqUserId);
        followingIdSet = await getFollowingIdSet(reqUserId);
        likeIdSet = await getLikeIdSet(reqUserId);
      }

      if (contentType === 'Board') {
        if (isForViewer) {
          if (reqUserId) {
            // 좋아요 여부
            targetContent.liked = !!likeIdSet.includes(targetContent._id.toString());
            // 북마크 여부
            targetContent.bookmarked = !!bookmarkIdSet.includes(targetContent._id.toString());
            // 팔로잉 여부
            if (targetContent.writer) {
              targetContent.writer.following =
                targetContent.writer._id.toString() === reqUserId
                  ? 'me'
                  : !!followingIdSet.includes(targetContent.writer._id.toString());
            }
            // 2차창작의 원작자에 대한 팔로잉 여부
            if (targetContent.originUserId) {
              targetContent.originUserId.following = !!followingIdSet.includes(
                targetContent.originUserId._id.toString()
              );
            }
          }

          // 피드백의 팔로잉, 좋아요
          const feedbacks = [];
          const filteredFeedbacks = targetContent.feedbacks.filter(each => each.writer !== null);

          filteredFeedbacks.map(async feedback => {
            const feedbackData = feedback;
            feedbackData.heartCount = await Like.countHearts(feedbackData._id, 'Feedback');

            if (reqUserId) {
              feedbackData.liked = !!likeIdSet.includes(feedback._id.toString());
              feedbackData.writer.following =
                feedback.writer._id.toString() === reqUserId
                  ? 'me'
                  : !!followingIdSet.includes(feedback.writer._id.toString());
            }

            feedbacks.push(feedback);
          });

          targetContent.feedbacks = feedbacks;
          targetContent.feedbackCount = feedbacks.length;
          targetContent.reactCount = await React.countReacts(targetContent._id);
          targetContent.heartCount = await Like.countHearts(targetContent._id, 'Board');
          resolve(targetContent);
        } else {
          // 메인페이지와 마이 보드에서 사용하는 *다수의 글 데이터*
          const filteredData = targetContent.filter(each => each.writer !== null);

          // 비회원일경우 바로 리턴
          if (!reqUserId) {
            return resolve(filteredData);
          }

          const resultSet = filteredData.map(data => {
            const boardData = data.toJSON();

            if (reqUserId) {
              boardData.bookmarked = !!bookmarkIdSet.includes(data._id.toString());
              boardData.liked = !!likeIdSet.includes(data._id.toString());
              boardData.writer.following =
                boardData.writer._id.toString() === reqUserId
                  ? 'me'
                  : !!followingIdSet.includes(data.writer._id.toString());
            }

            return boardData;
          });

          resolve(resultSet);
        }
      } else if (contentType === 'User') {
        // 유저 검색시에 사용
        const resultSet = await Promise.all(
          targetContent.map(async data => {
            const userData = data.toJSON();
            // 작품 수
            userData.illustCount = await Board.countByWriterAndCategory(userData._id, 0);
            userData.comicCount = await Board.countByWriterAndCategory(userData._id, 1);

            if (reqUserId) {
              userData.isFollowing =
                userData._id.toString() === reqUserId
                  ? 'me'
                  : !!(await Follow.didFollow({
                      userId: reqUserId,
                      targetUserId: userData._id,
                    }));
            }

            return userData;
          })
        );

        resolve(resultSet);
      } else if (contentType === 'Follow') {
        if (!reqUserId) {
          return resolve(contentData);
        }

        const followerIdSet = await getFollowerIdSet(reqUserId);
        const resultSet = targetContent.map(data => {
          const userData = data.toJSON();
          userData.following = !!followingIdSet.includes(reqUserId);
          userData.follower = !!followerIdSet.includes(reqUserId);
          return userData;
        });
        resolve(resultSet);
      } else {
        /* 피드백과 대댓글에서 팔로우, 좋아요 여부 확인 */
        const filteredData = targetContent.filter(each => each.writer !== null);

        // 비회원일 경우 바로 리턴
        if (!reqUserId) {
          return resolve(filteredData);
        }

        const resultSet = filteredData.map(data => {
          const userData = data.toJSON();
          userData.liked = !!likeIdSet.includes(userData._id.toString());
          userData.writer.following =
            reqUserId === userData._id.toString()
              ? 'me'
              : !!followingIdSet.includes(userData.writer._id.toString());

          return userData;
        });
        resultSet.replyCount = resultSet.length;
        resolve(resultSet);
      }
    } else {
      resolve([]);
    }
  });

function getBookmarkIdSet(userId) {
  return new Promise(async (resolve, reject) => {
    if (userId) {
      const bookmarkList = await Bookmark.getIdByUserId(userId);
      const bookmarkIdSet = bookmarkList.map(eachBookmark => eachBookmark.board.toString());
      resolve(bookmarkIdSet);
    } else {
      reject(new Error('UserId is required.'));
    }
  });
}

function getLikeIdSet(userId) {
  return new Promise(async (resolve, reject) => {
    if (userId) {
      const likeList = await Like.getByUserId(userId);
      const likeIdSet = likeList.map(eachLike => eachLike.targetInfo.toString());
      resolve(likeIdSet);
    } else {
      reject(new Error('UserId and type is required.'));
    }
  });
}

function getFollowingIdSet(userId) {
  return new Promise(async (resolve, reject) => {
    if (userId) {
      const followingList = await Follow.getFollowingIdList(userId);
      const followingIdSet = followingList.map(eachUser => eachUser.targetUserId.toString());
      resolve(followingIdSet);
    } else {
      reject(new Error('UserId is required.'));
    }
  });
}

function getFollowerIdSet(userId) {
  return new Promise(async (resolve, reject) => {
    if (userId) {
      const followerList = await Follow.getFollowerIdList(userId);
      const followerIdSet = followerList.map(eachUser => eachUser.userId.toString());
      resolve(followerIdSet);
    } else {
      reject(new Error('UserId is required.'));
    }
  });
}
