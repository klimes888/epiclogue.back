import Joi from 'joi';
import createError from 'http-errors';
import { startSession } from 'mongoose';
import { Board } from '../../models';
import { deleteImage, thumbPathGen } from '../../lib/imageCtrl';
import { contentsWrapper } from '../../lib/contentsWrapper';
import makeNotification from '../../lib/makeNotification';

/**
 * @description 유저 피드
 * @access GET /boards?type=[Illust, Comic]
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 요청한 글 배열
 */
export const getBoards = async (req, res, next) => {
  const { type: requestType } = req.query;
  const option = { pub: 1 };
  // 특정 카테고리만 요청할 경우
  if (requestType) {
    option.category = requestType === 'Illust' ? 0 : 1;
  }

  try {
    const boardList = await Board.findAll(option); // 썸네일만 골라내는 작업 필요
    const filteredBoardList = boardList.filter(each => each.writer !== null);
    const wrappedData = await contentsWrapper(res.locals.uid, filteredBoardList, 'Board', false);

    console.log(`[INFO] 유저 ${res.locals.uid || '비회원유저'} 가 자신의 피드를 확인했습니다.`);
    return res.status(200).json({
      result: 'ok',
      data: wrappedData,
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};

/**
 * @description 글 작성
 * @access POST /boards
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 생성된 글의 아이디
 */
export const postBoard = async (req, res, next) => {
  const _boardImg = req.files.map(file => file.location);

  let tags = '';
  if (req.body.boardBody) {
    tags = req.body.boardBody.match(/#[^\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"\s]+/g);
  }

  const boardData = {
    writer: res.locals.uid,
    boardTitle: req.body.boardTitle,
    boardBody: req.body.boardBody,
    category: req.body.category,
    pub: req.body.pub,
    language: req.body.language,
    allowSecondaryCreation: req.body.allowSecondaryCreation,
    boardImg: _boardImg,
    thumbnail: thumbPathGen(_boardImg[0].split('/')), // 첫 번째 이미지를 썸네일로 만듦
    tags,
    sourceUrl: req.body?.sourceUrl || null
  };

  const boardSchema = Joi.object({
    writer: Joi.string()
      .regex(/^[a-fA-F0-9]{24}$/)
      .required(),
    boardTitle: Joi.string().min(2).max(30).required(),
    boardImg: Joi.array().items(Joi.string().required()).required(),
    category: Joi.number().min(0).max(2).required(),
    pub: Joi.number().min(0).max(2).required(),
  });

  try {
    await boardSchema.validateAsync({
      writer: boardData.writer,
      boardImg: boardData.boardImg,
      boardTitle: boardData.boardTitle,
      category: boardData.category,
      pub: boardData.pub,
    });
  } catch (e) {
    // 이미지를 S3에 올린 이후에 DB에 저장하므로 이를 삭제합니다.
    if (boardData.boardImg.length > 0) {
      deleteImage(boardData.boardImg, 'board')
    }

    console.log(
      `[INFO] 유저 ${res.locals.uid} 가 적절하지 않은 데이터로 글을 작성하려 했습니다. ${e}`
    );
    return next(createError(400, '입력값이 적절하지 않습니다.'));
  }

  try {
    const createdBoard = await Board.create(boardData);

    console.log(`[INFO] 유저 ${boardData.writer}가 글 ${createdBoard._id}를 작성했습니다.`);
    return res.status(201).json({
      result: 'ok',
      data: { _id: createdBoard._id },
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};

/**
 * @description 글 뷰어
 * @access GET /boards/:boardId
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 글의 데이터
 */
export const viewBoard = async (req, res, next) => {
  const { boardId } = req.params;
  const { uid: userId } = res.locals;

  try {
    const boardData = await Board.getById(boardId);

    const wrappedBoardData = await contentsWrapper(userId, boardData, 'Board', true);

    console.log(`[INFO] 유저 ${userId || '비회원유저'}가 글 ${boardId}를 접근했습니다.`);

    return res.status(200).json({
      result: 'ok',
      data: wrappedBoardData,
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};

/**
 * @description 글 삭제
 * @access DELETE /boards/:boardId
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns -
 */
export const deleteBoard = async (req, res, next) => {
  const { boardId } = req.params;

  try {
    const query = await Board.getById(boardId, {
      _id: 0,
      feedbacks: 0,
      writer: 0,
      boardImg: 1,
    });
    // for non blocking, didn't use async-await
    deleteImage(query.boardImg, 'board')

    const deletion = await Board.delete(boardId);

    if (deletion.ok === 1) {
      console.log(`[INFO] 글 ${boardId}가 삭제되었습니다.`);
      return res.status(200).json({
        result: 'ok',
      });
    }
    console.error(
      `[ERROR] 글 ${boardId} 의 삭제가 실패했습니다: 데이터베이스 질의에 실패했습니다.`
    );
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};

/**
 * @description 글을 수정하기 위해 데이터 가져오기
 * @access GET /boards/:boardId/edit
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 수정할 글의 데이터
 */
export const getEditInfo = async (req, res, next) => {
  const { boardId } = req.params;

  try {
    const previousData = await Board.getById(boardId);

    console.log(
      `[INFO] 유저 ${res.locals.uid}가 글 ${boardId}을 수정을 위해 데이터를 요청했습니다.`
    );

    return res.status(200).json({
      result: 'ok',
      data: previousData,
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};

/**
 * @description 글 수정
 * @access PATCH /boards/:boardId/edit
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 수정한 글의 아이디
 */
export const postEditInfo = async function (req, res, next) {
  const boardImg = req.files ? req.files.map(file => file.location) : [];
  const session = await startSession();
  let tags = '';

  if (req.body.boardBody) {
    tags = req.body.boardBody.match(/#[^\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"\s]+/g);
  }

  try {
    const originalData = await Board.getById(req.params.boardId);

    deleteImage(originalData.boardImg, 'board')

    const updateData = {
      boardId: req.params.boardId,
      boardTitle: req.body.boardTitle || originalData.boardTitle,
      boardBody: req.body.boardBody || originalData.boardBody,
      boardImg: boardImg || originalData.boardImg,
      category: parseInt(req.body.category || originalData.category, 10),
      pub: parseInt(req.body.pub || originalData.pub, 10),
      language: parseInt(req.body.language || originalData.language, 10),
      thumbnail: thumbPathGen(boardImg[0].split('/')),
      tags,
    };

    await session.withTransaction(async () => {
      const patch = await Board.update(updateData).session(session);
      if (patch.ok === 1) {
        const updatedBoardData = await Board.getById(req.params.boardId).session(session);
        console.log(`[INFO] 유저 ${res.locals.uid}가 글 ${req.params.boardId}을 수정했습니다.`);
        return res.status(200).json({ result: 'ok', data: { _id: updatedBoardData._id } });
      }
      console.error(
        `[ERROR] 글 ${req.params.boardId}의 수정이 실패했습니다: 데이터베이스 질의에 실패했습니다.`
      );
      return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  } finally {
    session.endSession();
  }
};

/**
 * @description 2차 창작
 * @access POST /boards/sec
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS next middleware
 * @returns 생성된 글의 아이디
 */
export const secPost = async (req, res, next) => {
  const boardImg = req.files ? req.files.map(file => file.location) : [];

  let tags = '';
  if (req.body.boardBody) {
    tags = req.body.boardBody.match(/#[^\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"\s]+/g);
  }

  const boardData = {
    writer: res.locals.uid,
    boardTitle: req.body.boardTitle,
    boardBody: req.body.boardBody,
    category: req.body.category,
    pub: req.body.pub,
    language: req.body.language,
    boardImg,
    originUserId: req.body.originUserId,
    originBoardId: req.body.originBoardId,
    thumbnail: thumbPathGen(boardImg[0].split('/')),
    tags,
  };

  const boardSchema = Joi.object({
    writer: Joi.string()
      .regex(/^[a-fA-F0-9]{24}$/)
      .required(),
    boardTitle: Joi.string().min(2).max(30).required(),
    boardImg: Joi.array().items(Joi.string().required()).required(),
    category: Joi.number().min(0).max(2).required(),
    pub: Joi.number().min(0).max(2).required(),
    originUserId: Joi.string()
      .regex(/^[a-fA-F0-9]{24}$/)
      .required(),
    originBoardId: Joi.string()
      .regex(/^[a-fA-F0-9]{24}$/)
      .required(),
  });

  try {
    await boardSchema.validateAsync({
      writer: boardData.writer,
      boardImg: boardData.boardImg,
      boardTitle: boardData.boardTitle,
      category: boardData.category,
      pub: boardData.pub,
      originUserId: boardData.originUserId,
      originBoardId: boardData.originBoardId,
    });
  } catch (e) {
    // 이미지를 S3에 올린 이후에 DB에 저장하므로 이를 삭제합니다.
    if (boardData.boardImg.length > 0) {
      deleteImage(boardData.boardImg, 'board')
    }

    console.log(
      `[INFO] 유저 ${res.locals.uid} 가 적절하지 않은 데이터로 글을 작성하려 했습니다. ${e}`
    );
    return next(createError(400, '입력값이 적절하지 않습니다.'));
  }

  try {
    const session = await startSession();
    await session.withTransaction(async () => {
      const createdBoard = await new Board(boardData).save({ session });
      await makeNotification(
        {
          targetUserId: req.body.originUserId,
          maker: res.locals.uid,
          notificationType: 'Secondary',
          targetType: 'Board',
          targetInfo: createdBoard._id,
        },
        session
      );
      console.log(`[INFO] 유저 ${boardData.writer}가 2차창작 ${createdBoard._id}를 작성했습니다.`);
      return res.status(201).json({
        result: 'ok',
        data: { _id: createdBoard._id },
      });
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'));
  }
};
