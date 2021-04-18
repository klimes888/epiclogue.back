import createError from 'http-errors'
import { boardDAO, feedbackDAO, replyDAO, likeDAO, reactDAO, followDAO, bookmarkDAO } from '../DAO'

/**
 * 유저에 맞는 컨텐츠를 제공하기 위한 래퍼객체
 * @param {string}  reqUserId   - 요청한 유저의 MongoDB ID
 * @param {Array}   contentData - 감싸질 데이터. 뷰어에서 요청했을 경우 Object 타입이어야 한다.
 * @param {string}  contentType - 컨텐츠의 타입. enum ["Board", "Feedback", "Reply"]
 * @param {Boolean} isForViewer - 데이터가 컨텐츠 뷰어에서 사용될 것인지 여부
 */
export const contentsWrapper = async (reqUserId, contentData, contentType, isForViewer) => {
  // 회원/비회원 유저에 관계없이 필요한 데이터: 컨텐츠(글/댓글/대댓글)의 좋아요/리액트/북마크 카운트
  // 회원에게만 필요한 데이터: 해당 컨텐츠(글/댓글/대댓글)의 좋아요/북마크 여부
  let resultSet
  if (!contentType) {
    createError(400, '컨텐츠 타입이 존재하지 않습니다.')
  } else if (contentData) {
    // MongoDB JSON을 pure JSON 으로 변환
    let targetContent = contentData
    if (!(contentData instanceof Array)) {
      targetContent = contentData.toJSON()
    }

    let bookmarkIdSet
    let followingIdSet
    let likeIdSet
    let followerIdSet

    // 회원일 경우
    if (reqUserId) {
      bookmarkIdSet = await getBookmarkIdSet(reqUserId)
      followingIdSet = await getFollowingIdSet(reqUserId)
      likeIdSet = await getLikeIdSet(reqUserId)
      followerIdSet = await getFollowerIdSet(reqUserId)
    }

    if (contentType === 'Board') {
      if (isForViewer) {
        if (reqUserId) {
          // 좋아요 여부
          targetContent.liked = !!likeIdSet.includes(targetContent._id.toString())
          // 북마크 여부
          targetContent.bookmarked = !!bookmarkIdSet.includes(targetContent._id.toString())
          // 팔로잉 여부
          if (targetContent.writer) {
            targetContent.writer.following =
              targetContent.writer._id.toString() === reqUserId
                ? 'me'
                : !!followingIdSet.includes(targetContent.writer._id.toString())
          }
          // 2차창작의 원작자에 대한 팔로잉 여부
          if (targetContent.originUserId) {
            targetContent.originUserId.following = !!followingIdSet.includes(
              targetContent.originUserId._id.toString()
            )
          }
        }
        // 피드백의 팔로잉, 좋아요
        let filteredFeedbacks = await feedbackDAO.getByBoardId(targetContent._id)
        filteredFeedbacks = filteredFeedbacks.filter(each => each.writer !== null)

        const feedbacks = await Promise.all(
          filteredFeedbacks.map(async feedback => {
            const feedbackData = feedback.toJSON()
            feedbackData.heartCount = await likeDAO.countHearts(feedbackData._id, 'Feedback')
            feedbackData.replyCount = await replyDAO.countReplys(feedbackData._id)
            if (reqUserId) {
              feedbackData.liked = !!likeIdSet.includes(feedback._id.toString())
              feedbackData.writer.following =
                feedback.writer._id.toString() === reqUserId
                  ? 'me'
                  : !!followingIdSet.includes(feedback.writer._id.toString())
            }
            return feedbackData
          })
        )

        targetContent.feedbacks = feedbacks
        targetContent.feedbackCount = feedbacks.length
        targetContent.reactCount = await reactDAO.countReacts(targetContent._id)
        targetContent.heartCount = await likeDAO.countHearts(targetContent._id, 'Board')
        resultSet = targetContent
      } else {
        // 메인페이지와 마이 보드에서 사용하는 *다수의 글 데이터*
        const filteredData = targetContent.filter(each => each.writer !== null)

        // 비회원일경우 바로 리턴
        resultSet = !reqUserId
          ? filteredData
          : filteredData.map(data => {
              const boardData = data.toJSON()
              boardData.bookmarked = !!bookmarkIdSet.includes(data._id.toString())
              boardData.liked = !!likeIdSet.includes(data._id.toString())
              boardData.writer.following =
                boardData.writer._id.toString() === reqUserId
                  ? 'me'
                  : !!followingIdSet.includes(data.writer._id.toString())

              return boardData
            })
      }
    } else if (contentType === 'User') {
      // 유저 검색시에 사용
      resultSet = await Promise.all(
        targetContent.map(async data => {
          const userData = data.toJSON()
          // 작품 수
          userData.illustCount = await boardDAO.countByWriterAndCategory(userData._id, 0)
          userData.comicCount = await boardDAO.countByWriterAndCategory(userData._id, 1)

          if (reqUserId) {
            userData.isFollowing =
              userData._id.toString() === reqUserId
                ? 'me'
                : !!(await followDAO.didFollow({
                    userId: reqUserId,
                    targetUserId: userData._id,
                  }))
          }

          return userData
        })
      )
    } else if (contentType === 'Follow') {
      resultSet = !reqUserId
        ? contentData
        : targetContent.map(data => {
            const userData = data.toJSON()
            const targetId = userData?.userId
              ? userData.userId._id.toString()
              : userData.targetUserId._id.toString()
            userData.following = !!followingIdSet.includes(targetId)
            userData.follower = !!followerIdSet.includes(targetId)
            return userData
          })
    } else {
      if (!Array.isArray(contentData)) {
        const jsonConvertedData = contentData.toJSON()
        jsonConvertedData.liked = !!likeIdSet.includes(jsonConvertedData._id)
        jsonConvertedData.writer.following = 
          reqUserId === jsonConvertedData._id
            ? 'me'
            : !!followingIdSet.includes(jsonConvertedData.writer._id)
        return jsonConvertedData
      }
      /* 피드백과 대댓글에서 팔로우, 좋아요 여부 확인 */
      const filteredData = targetContent.filter(each => each.writer !== null)

      // 비회원일 경우 바로 리턴
      resultSet = !reqUserId
        ? filteredData
        : await Promise.all(
            filteredData.map(async data => {
              const userData = data.toJSON()
              userData.liked = !!likeIdSet.includes(userData._id.toString())
              userData.writer.following =
                reqUserId === userData._id.toString()
                  ? 'me'
                  : !!followingIdSet.includes(userData.writer._id.toString())
              userData.heartCount = await likeDAO.countHearts(userData._id, 'Reply')
              return userData
            })
          )
    }
  }
  return resultSet === undefined ? [] : resultSet
}

const getBookmarkIdSet = async userId => {
  const bookmarkList = await bookmarkDAO.getIdByUserId(userId)
  const bookmarkIdSet = bookmarkList.map(eachBookmark => eachBookmark.board.toString())
  return bookmarkIdSet
}

const getLikeIdSet = async userId => {
  const likeList = await likeDAO.getIdByUserId(userId)
  const likeIdSet = likeList.map(eachLike => eachLike.targetInfo.toString())
  return likeIdSet
}

const getFollowingIdSet = async userId => {
  const followingList = await followDAO.getFollowingIdList(userId)
  const followingIdSet = followingList.map(eachUser => eachUser.targetUserId.toString())
  return followingIdSet
}

const getFollowerIdSet = async userId => {
  const followerList = await followDAO.getFollowerIdList(userId)
  const followerIdSet = followerList.map(eachUser => eachUser.userId.toString())
  return followerIdSet
}
