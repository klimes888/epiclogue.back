import Reply from "../../../../models/reply"
import User from '../../../../models/users'
import Feedback from '../../../../models/feedback'
/* 
  This is reply router.
  base url: /:userId/boards/:boardId/reply
*/

// 대댓글 생성
export const postReply = async (req, res, next) => {
  const replyForm = {
    userId: res.locals.uid,
    boardId: req.params.boardId,
    parentId: req.body.parentId,
    replyBody: req.body.replyBody,
  };

  const newerDataSet = []

  try {
    await Reply.create(replyForm);
    await Feedback.getChild(replyForm.parentId)
    const newerReplyData = await Reply.getByParentId(replyForm.parentId);
    for (let data of newerReplyData) {
      let userData = await User.getUserInfo(data.userId, { _id: 0, nickname: 1, screenId: 1, profile: 1 })
      
      let resultData = {
        _id: data._id,
        boardId: data.boardId,
        parentId: data.parentId,
        replyBody: data.replyBody,
        edited: data.edited,
        heartCount: data.heartCount,
        writeDate: data.writeDate,
        userInfo: userData
      }
      newerDataSet.push(resultData)
    }
    return res.status(200).json({
      result: "ok",
      data: newerDataSet,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};

// 댓글 하위의 대댓글 뷰
export const getReplys = async (req, res, next) => {
  const parentId = req.params.parentId;
  const resultDataSet = []

  try {
    const replyData = await Reply.getByParentId(parentId);
    for (let data of replyData) {
      let userData = await User.getUserInfo(data.userId, { _id: 0, nickname: 1, screenId: 1, profile: 1 })
      let resultData = {
        _id: data._id,
        boardId: data.boardId,
        parentId: data.parentId,
        replyBody: data.replyBody,
        edited: data.edited,
        heartCount: data.heartCount,
        writeDate: data.writeDate,
        userInfo: userData
      }
      resultDataSet.push(resultData)
    }
    return res.status(200).json({
      result: "ok",
      data: resultDataSet,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};

export const editReply = async (req, res, next) => {
  const newForm = {
    replyId: req.params.replyId,
    newReplyBody: req.body.newReplyBody,
  };
  const resultDataSet = [];
  const parentId = await Reply.getParentId(req.params.replyId);
  
  try {
    const patch = await Reply.update(newForm);

    if (patch.ok === 1) {
      if (patch.n === 1 && patch.n === patch.nModified) {
        console.log(`Feedback ${parentId} 의 reply ${req.params.replyId} 수정 완료`)
      } else if (patch.n === 1 && patch.n !== patch.nModified) {
        console.warn(`Feedback ${parentId} 의 reply ${req.params.replyId} 의 수정이 질의에 성공했으나 데이터가 수정되지 않았습니다.`)
        return res.status(200).json({
          result: "ok",
          message: "질의에 성공했으나 데이터가 수정되지 않았습니다.",
        });
      } else if (patch.n === 0) {
        return res.status(404).json({
          result: "error",
          message: "존재하지 않는 데이터에 접근했습니다.",
        });
      }
    }
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};

export const deleteReply = async (req, res, next) => {
  const replyId = req.params.replyId;

  try {
    const parentId = await Reply.getById(replyId);
    const deleteResult = await Reply.delete(replyId, { parentId: 1 });
    if (deleteResult.ok === 1) {
      const newerReplyData = await Reply.getByParentId(parentId);

      if (
        deleteResult.n === 1 &&
        deleteResult.n === deleteResult.deletedCount
      ) {
        return res.send(200).json({
          result: "ok",
          data: newerReplyData,
        });
      } else if (
        deleteResult.ok === 1 &&
        deleteResult.n !== deleteResult.deletedCount
      ) {
        return res.status(200).json({
          result: "ok",
          message: "질의에 성공했으나 데이터가 삭제되지 않았습니다.",
        });
      } else if (deleteResult.n === 0) {
        return res.status(404).json({
          result: "error",
          message: "존재하지 않는 데이터에 접근했습니다.",
        });
      }
    } else {
      return res.status(500).json({
        result: "error",
        message: "데이터베이스 질의 실패",
      });
    }
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};