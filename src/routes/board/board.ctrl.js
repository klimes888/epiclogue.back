import { Board } from '../../models'
import { s3 } from '../../lib/imageUpload'
import Joi from 'joi'

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

  const boardData = {
    writer: res.locals.uid,
    boardTitle: req.body.boardTitle,
    boardBody: req.body.boardBody,
    category: req.body.category,
    pub: req.body.pub,
    lanuage: req.body.lanuage,
    boardImg: _boardImg,
  }

  const boardSchema = Joi.object({
    writer: Joi.string().regex(/^[A-Fa-f0-9]{24}$/).required(),
    boardImg: Joi.array().items(Joi.string().required()).required(),
    // boardImg: Joi.array().items(Joi.string()).required(),
    category: Joi.string().required(),
    pub: Joi.number().min(0).max(2).required()
  })

  try {
    await boardSchema.validateAsync({
      writer: boardData.writer,
      boardImg: boardData.boardImg,
      category: boardData.category,
      pub: boardData.pub
    })
  } catch (e) {
    if (boardData.boardImg.length > 0) {
      const garbageImage = []
      for (let image of boardData.boardImg) {
        const objectKey = image.split('/')
        const deletionFormat = {
          Key: objectKey[3]
        }
        garbageImage.push(deletionFormat)
      }

      s3.deleteObjects({
        Bucket: process.env.AWS_BUCKET_NAME,
        Delete: {
          Objects: garbageImage
        }
      }, (err, data) => {
        if (err) console.error(err, err.stack)
      })
    }

    console.warn(`[WARN] 유저 ${res.locals.uid} 가 적절하지 않은 데이터로 글을 작성하려 했습니다. ${e}`)
    return res.status(400).json({
      result: 'error',
      message: '입력값이 적절하지 않습니다.'
    })
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
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
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
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}

// 삭제
export const deleteBoard = async (req, res, next) => {
  const boardId = req.params.boardId
  const query = await Board.getById(boardId, { _id: 0, feedbacks: 0, writer: 0, boardImg: 1 })
  const images = query.boardImg

  const beDeletedObject = []

  for (let each of images) {
    const texts = each.split('/') // get only object name
    let deletionFormat = {
      Key: texts[3]
    } 
    beDeletedObject.push(deletionFormat)
  }

  // console.log(beDeletedObject)

  try {
    // for non blocking, didn't use async-await
    s3.deleteObjects({
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: beDeletedObject
      }
    }, (err, data) => {
      if (err) console.error(err, err.stack)
    })

    const deletion = await Board.delete(boardId)

    if (deletion.ok === 1) {
      console.log(`[INFO] 글 ${boardId}가 삭제되었습니다.`)
      return res.status(200).json({
        result: 'ok',
      })
    } else {
      console.warn(`[WARN] 유저 ${res.locals.uid} 가 존재하지 않는 글 ${boardId} 의 삭제를 시도했습니다.`)
      return res.status(404).json({
        result: 'error',
        message: 'Not found'
      })
    }
  } catch (e) {
    console.error(`[ERROR] ${e}`)
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
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
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
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
    const images = originalData.boardImg
    const beDeletedObject = []

    for (let each of images) {
      const texts = each.split('/') // get only object name
      let deletionFormat = {
        Key: texts[3]
      } 
      beDeletedObject.push(deletionFormat)
    }

    s3.deleteObjects({
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: beDeletedObject
      }
    }, (err, data) => {
      if (err) console.error(err, err.stack)
    })

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
      if (patch.n === 1) {
        const newerData = await Board.getById(req.params.boardId)
        console.log(`[INFO] 유저 ${res.locals.uid}가 글 ${req.params.boardId}을 수정했습니다.`)
        return res.status(200).json({
          result: 'ok',
          data: newerData,
        })
      } else if (patch.n === 0) {
        console.log(
          `[WARN] 유저 ${res.locals.uid}가 글 ${req.params.boardId}을 수정하려했으나 존재하지 않습니다.`
        )
        return res.status(404).json({
          result: 'error',
          message: '존재하지 않는 데이터에 접근했습니다.',
        })
      }
    } else {
      console.error(`[ERROR] 글 ${req.params.boardId}의 수정이 실패했습니다.`)
      return res.status(500).json({
        result: 'ok',
        message: '수정에 실패했습니다.',
      })
    }
  } catch (e) {
    console.error(`[ERROR] ${e}`)
    return res.status(500).json({
      result: 'ok',
      message: e.message,
    })
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
    return res.status(500).json({
      result: 'error',
      message: e.message,
    })
  }
}
