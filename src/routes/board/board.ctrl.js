import { Board } from '../../models'
import { deleteImage } from '../../lib/imageCtrl'
import Joi from 'joi'
import createError from 'http-errors'

/* 
  This is board router.
  base url: /boards/[boardId]
  OPTIONS: [ GET / POST / DELETE ]
*/

export const postBoard = async (req, res, next) => {
  let _boardImg = []
  for (let i = 0; i < req.files.length; i++) {
    _boardImg.push(req.files[i].location)
  }

  let tags = []
  const tagsWithHash = req.body.boardBody.match(
    /#[^\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"\s]+/g
  )
  if (tagsWithHash) {
    for (const tag of tagsWithHash) {
      tags.push(tag.substring(1))
    }
  }

  const boardData = {
    writer: res.locals.uid,
    boardTitle: req.body.boardTitle,
    boardBody: req.body.boardBody,
    category: req.body.category,
    pub: req.body.pub,
    lanuage: req.body.lanuage,
    boardImg: _boardImg,
    tags
  }

  const boardSchema = Joi.object({
    writer: Joi.string()
      .regex(/^[a-fA-F0-9]{24}$/)
      .required(),
    // array() 안의 string().required() 도 작성해야합니다...
    boardImg: Joi.array().items(Joi.string().required()).required(),
    category: Joi.string().required(),
    pub: Joi.number().min(0).max(2).required(),
  })

  try {
    await boardSchema.validateAsync({
      writer: boardData.writer,
      boardImg: boardData.boardImg,
      category: boardData.category,
      pub: boardData.pub,
    })
  } catch (e) {
    if (boardData.boardImg.length > 0) {
      deleteImage(boardData.boardImg)
    }

    console.warn(
      `[WARN] 유저 ${res.locals.uid} 가 적절하지 않은 데이터로 글을 작성하려 했습니다. ${e}`
    )
    return next(createError(400, '입력값이 적절하지 않습니다.'))
  }

  try {
    const createdBoard = await Board.create(boardData)

    console.log(`[INFO] 유저 ${boardData.writer}가 글 ${createdBoard._id}를 작성했습니다.`)

    return res.status(201).json({
      result: 'ok',
      data: createdBoard,
    })
  } catch (e) {
    console.error(`[ERROR] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

// 글 뷰
export const viewBoard = async (req, res, next) => {
  const boardId = req.params.boardId

  try {
    const boardData = await Board.getById(boardId)

    console.log(`[INFO] 유저 ${res.locals.uid}가 글 ${boardId}를 접근했습니다.`)

    return res.status(200).json({
      result: 'ok',
      data: boardData,
    })
  } catch (e) {
    console.error(`[ERROR] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

// 삭제
export const deleteBoard = async (req, res, next) => {
  const boardId = req.params.boardId
  const query = await Board.getById(boardId, { _id: 0, feedbacks: 0, writer: 0, boardImg: 1 })

  try {
    // for non blocking, didn't use async-await
    deleteImage(query.boardImg)

    const deletion = await Board.delete(boardId)

    if (deletion.ok === 1) {
      console.log(`[INFO] 글 ${boardId}가 삭제되었습니다.`)
      return res.status(200).json({
        result: 'ok',
      })
    } else {
      console.error(
        `[ERROR] 글 ${boardId} 의 삭제가 실패했습니다: 데이터베이스 질의에 실패했습니다.`
      )
      return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
    }
  } catch (e) {
    console.error(`[ERROR] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

// 수정 전 이전 데이터 불러오기
export const getEditInfo = async (req, res, next) => {
  const boardId = req.params.boardId

  try {
    const previousData = await Board.getById(boardId)

    console.log(
      `[INFO] 유저 ${res.locals.uid}가 글 ${boardId}을 수정을 위해 데이터를 요청했습니다.`
    )

    return res.status(200).json({
      result: 'ok',
      data: previousData,
    })
  } catch (e) {
    console.error(`[ERROR] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

// 수정
export const postEditInfo = async function (req, res, next) {
  let boardImg = null

  if (req.files !== undefined) {
    boardImg = []
    for (let i = 0; i < req.files.length; i++) {
      boardImg.push(req.files[i].location)
    }
  }

  try {
    const originalData = await Board.getById(req.params.boardId)

    deleteImage(originalData.boardImg)

    const updateData = {
      boardId: req.params.boardId,
      boardTitle: req.body.boardTitle || originalData.boardTitle,
      boardBody: req.body.boardBody || originalData.boardBody,
      boardImg: boardImg || originalData.boardImg,
      category: parseInt(req.body.category || originalData.category),
      pub: parseInt(req.body.pub || originalData.pub),
      language: parseInt(req.body.language || originalData.language),
    }

    const patch = await Board.update(updateData)

    if (patch.ok === 1) {
      const newerData = await Board.getById(req.params.boardId)

      console.log(`[INFO] 유저 ${res.locals.uid}가 글 ${req.params.boardId}을 수정했습니다.`)
      return res.status(200).json({
        result: 'ok',
        data: newerData,
      })
    } else {
      console.error(
        `[ERROR] 글 ${req.params.boardId}의 수정이 실패했습니다: 데이터베이스 질의에 실패했습니다.`
      )
      return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
    }
  } catch (e) {
    console.error(`[ERROR] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

/* 유저마다 다르게 받아야 함 */
export const getBoards = async (req, res, next) => {
  try {
    const boardList = await Board.findAll() // 썸네일만 골라내는 작업 필요

    console.log(`[INFO] 유저 ${res.locals.uid} 가 자신의 피드를 확인했습니다.`)
    return res.status(200).json({
      result: 'ok',
      data: boardList,
    })
  } catch (e) {
    console.error(`[ERROR] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}
