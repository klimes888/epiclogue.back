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
                  : !!followingIdSet.includes(targetContent.writer._id);
            }
            // 2차창작의 원작자에 대한 팔로잉 여부
            if (targetContent.originUserId) {
              targetContent.originUserId.following = !!followingIdSet.includes(
                targetContent.originUserId._id.toString()
              );
            }
          }

          // like, following on feedbacks
          const feedbacks = [];
          const filteredFeedbacks = targetContent.feedbacks.filter(each => each.writer !== null);

          filteredFeedbacks.map(async (feedback) => {
            const feedbackData = feedback;
            feedbackData.heartCount = await Like.countHearts(feedbackData._id, 'Feedback');

            if (reqUserId) {
              feedbackData.liked = !!likeIdSet.includes(feedback._id);
              feedbackData.writer.following =
                feedback.writer._id === reqUserId
                  ? 'me'
                  : !!followingIdSet.includes(feedback.writer._id);
            }

            feedbacks.push(feedback);
          });

          targetContent.feedbacks = feedbacks;
          targetContent.feedbackCount = feedbacks.length;
          targetContent.reactCount = await React.countReacts(targetContent._id);

          resolve(targetContent);
        } else {
          // 메인페이지와 마이 보드에서 사용하는 *다수의 글 데이터*
          const filteredData = targetContent.filter(each => each.writer !== null);

          if (!reqUserId) {
            resolve(filteredData);
          }

          const resultSet = filteredData.map(data => {
            const boardData = data.toJSON();
            
            if (reqUserId) {
              boardData.bookmarked = !!bookmarkIdSet.includes(data._id.toString());
              boardData.liked = !!likeIdSet.includes(data._id.toString());
              boardData.writer.following = boardData.writer._id === reqUserId ? 'me' : !!followingIdSet.includes(data.writer._id.toString());
            }

            return boardData;
          });

          resolve(resultSet);
        }
      } else if (contentType === 'User') {
        const resultSet = [];

        for (let userData of targetContent) {
          // 팔로우 여부 (회원일 경우에만 적용)
          userData = userData.toJSON();
          if (reqUserId) {
            userData.isFollowing =
              userData._id === reqUserId
                ? !!(await Follow.didFollow({
                    userId: reqUserId,
                    targetUserId: userData._id,
                  }))
                : 'me';
          }

          // 작품 수
          userData.illustCount = await Board.countByWriterAndCategory(userData._id, 0);
          userData.comicCount = await Board.countByWriterAndCategory(userData._id, 1);
          resultSet.push(userData);
        }
        resolve(resultSet);
      } else {
        /* following, like on feedbacks and replies */
        const likeIdSet = await getLikeIdSet(reqUserId, contentType);
        const resultSet = [];
        const filteredData = targetContent.filter(each => each.writer !== null);
        for (let data of filteredData) {
          data = data.toJSON();
          data.liked = !!likeIdSet.includes(data._id.toString());
          if (data.writer && data.writer._id.toString() === reqUserId) {
            data.writer.following = 'me';
          } else {
            data.writer.following = !!followingIdSet.includes(data.writer._id.toString());
          }
          resultSet.push(data);
        }
        resolve(resultSet);
      }
    } else {
      resolve([]);
    }
  });

function getBookmarkIdSet(userId) {
  return new Promise(async (resolve, reject) => {
    if (userId) {
      const bookmarkList = await Bookmark.find({ user: userId }, { board: 1, _id: 0 });
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
      const likeList = await Like.find({ userId }, { targetInfo: 1, _id: 0 });
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
      const followingList = await Follow.find({ userId }, { targetUserId: 1, _id: 0 });
      const followingIdSet = followingList.map(eachUser => eachUser.targetUserId.toString());
      resolve(followingIdSet);
    } else {
      reject(new Error('UserId is required.'));
    }
  });
}
