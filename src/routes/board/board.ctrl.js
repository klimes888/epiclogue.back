import Board from "../../models/board";
import Feedback from "../../models/feedback";
import User from "../../models/users"

export const postBoard = async function (req, res, next) {
  const uid = res.locals.uid;
  const boardTitle = req.body.boardTitle;
  const boardBody = req.body.boardBody;
  let boardImg = [];
  for (let i = 0; i < req.files.length; i++) {
    boardImg.push(req.files[i].location);
  }
  const category = req.body.category;
  const pub = req.body.pub;
  const language = req.body.language;

  try {
    const result = await Board.create({
      uid,
      boardTitle,
      boardBody,
      boardImg,
      category,
      pub,
      language,
      likeCount: 0,
    });
    console.log(`[INFO] user ${uid}가 글 ${result._id}를 작성했습니다.`)
    return res.status(201).json({
      result: "ok",
      data: result,
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};

// 글 뷰
export const viewBoard = async (req, res, next) => {
  const boardId = req.params.boardId;

  try {
    const boardData = await Board.getById(boardId);
    const writerData = await User.getUserInfo(boardData.uid, {
      nickname: 1,
      userid: 1,
    });
    const feedbackWithoutUserInfo = await Feedback.getByBoardId(boardId);
    const feedbackData = [];

    for (const reply of feedbackWithoutUserInfo) {
      let { nickname, screenId } = await User.getUserInfo(reply.userId);

      feedbackData.push({
        _id: reply._id,
        buid: reply.buid,
        edited: reply.edited,
        feedbackBody: reply.feedbackBody,
        writeDate: reply.writeDate,
        userInfo: {
          screenId,
          nickname,
        },
      });
    }
    console.log(`[INFO] 유저 ${res.locals.uid}가 글 ${boardId}를 접근했습니다.`)
    return res.status(200).json({
      result: "ok",
      data: {
        writer: writerData,
        board: boardData,
        feedback: feedbackData,
      },
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};

// 삭제
export const deleteBoard = async function (
  req,
  res,
  next
) {
  const boardId = req.params.boardId;

  try {
    const deletion = await Board.delete(boardId);

    if (deletion.ok === 1) {
      console.log(`[INFO] 글 ${boardId}가 삭제되었습니다.`)
      return res.status(200).json({
        result: 'ok'
      })
    } else {
      console.warn(`[ERROR] 글 ${boardId}의 삭제가 실패하였습니다.`)
      return res.status(400).json({
      
      })
    }
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};

// 수정 전 이전 데이터 불러오기
export const getEditInfo = async function (
  req,
  res,
  next
) {
  const boardId = req.params.boardId;

  try {
    const previousData = await Board.getById(boardId);
    
    console.log(`[INFO] 유저 ${res.locals.uid}가 글 ${boardId}을 수정을 위해 데이터를 요청했습니다.`)
    
    return res.status(200).json({
      result: "ok",
      data: previousData,
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};

// 수정
export const postEditInfo = async function (req, res, next) {
    let boardImg = [];
    for (let i = 0; i < req.files.length; i++) {
      boardImg.push(req.files[i].location);
    }
    const updateData = {
      boardId: req.params.boardId,
      boardTitle: req.body.boardTitle,
      boardBody: req.body.boardBody,
      boardImg: boardImg,
      category: req.body.category,
      pub: req.body.pub,
      language: req.body.language,
    };

    try {
      const patch = await Board.update(updateData);
      if (patch.ok === 1) {
        console.log(`[INFO] 유저 ${res.locals.uid}가 글 ${req.params.boardId}을 수정했습니다.`)
        if (patch.n === 1 && patch.n === patch.nModified) {
          return res.sendStatus(200);
        } else if (patch.n === 1 && patch.n !== patch.nModified) {
          return res.status(200).json({

            msg: "질의에 성공했으나 데이터가 수정되지 않았습니다.",
          });
        } else if (patch.n === 0) {
          return res.status(404).json({
            msg: "존재하지 않는 데이터에 접근했습니다.",
          });
        }
      }
    } catch (e) {
      console.error(`[ERROR] ${e}`);
      return res.status(500).json({
        result: "ok",
        message: e.message,
      });
    }
  };

/* 유저마다 다르게 받아야 함 */
export const getBoards = async (req, res, next) => {
  const result = new Array();

  try {
    const boardList = await Board.findAll();

    for (const data of boardList) {
      let userInfo = await User.getUserInfo(data.uid);

      result.push({
        boardUid: data._id,
        boardTitle: data.boardTitle,
        thumbPath: data.boardImg[0],
        userNick: userInfo.nickname,
        pub: data.pub,
        category: data.category,
      });
    }

    return res.status(200).json({
      result: "ok",
      data: result,
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};