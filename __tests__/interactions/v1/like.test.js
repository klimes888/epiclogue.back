import dotenv from 'dotenv'
import randomString from 'random-string'
import request from 'supertest'
import fs from 'fs'
import path from 'path'
import { describe, expect, test } from '@jest/globals'

import { confirmUser } from '../../../src/DAO/user'
import app from '../../../src/app'
import { getAccessTokenFromCookie } from '../../configs/cookieParser'

dotenv.config()

let userToken
const invalidId = '123456789012345678901234'
let testBoardId
let testFeedbackId
let testReplyId
describe('좋아요 테스트', () => {
  const tempPw = `${randomString()}1!2@3#4$`
  const userData = {
    email: 'like@lunarcat.com',
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: randomString(),
    userLang: 0,
  }

  const boardData = {
    boardTitle: 'a board Title',
    boardBody: 'a board Body',
    category: 0,
    pub: 1,
    language: 'Korean',
  }

  const imgPath = path.join(`${__dirname}/../../testImages`)
  const imagePathArray = []
  fs.readdir(imgPath, (err, files) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    files.forEach(name => {
      imagePathArray.push(`${imgPath}/${name}`)
    })
  })

  // eslint-disable-next-line no-undef
  beforeAll(async () => {
    await request(app).post('/auth/join').send(userData)
    await confirmUser(userData.email)
    const verifiedLoginReponse = await request(app).post('/auth/login').send(userData)

    userToken = getAccessTokenFromCookie(verifiedLoginReponse.headers['set-cookie'])
  })

  describe('선수 작업', () => {
    test('글 작성 | 201', async () => {
      const uploadInstance = await request(app)
        .post('/boards')
        .set('Cookie', `access_token=${userToken}`)
        .field('boardTitle', boardData.boardTitle)
        .field('boardBody', boardData.boardBody)
        .field('category', boardData.category)
        .field('pub', boardData.pub)
        .field('language', boardData.language)
        .attach('boardImg', imagePathArray[1])

      const uploadRes = JSON.parse(uploadInstance.res.text)
      testBoardId = uploadRes.data._id

      // console.log(testBoardId) // ok
    })

    test('피드백 작성 | 201', async () => {
      const rawResponse = await request(app)
        .post(`/boards/${testBoardId}/feedback`)
        .set('Cookie', `access_token=${userToken}`)
        .send({ feedbackBody: 'feedback body ever seen!' })

      // extract feedbackId
      const extractedResponse = JSON.parse(rawResponse.res.text)
      testFeedbackId = extractedResponse.data[0]._id
      // console.log(testFeedbackId) // ok
    })

    test('댓글 작성 | 201', async () => {
      const response = await request(app)
        .post(`/boards/${testBoardId}/feedback/${testFeedbackId}/reply`)
        .set('Cookie', `access_token=${userToken}`)
        .send({ replyBody: 'hi, it is reply body' })

      expect(response.statusCode).toBe(201)

      testReplyId = response.body.data[0]._id
    })
  })

  describe('공통', () => {
    test('실패: 적절하지 않은 타입 | 400', async () => {
      await request(app)
        .post(`/interaction/like`)
        .send({ targetType: 'Test', targetInfo: testBoardId })
        .set('Cookie', `access_token=${userToken}`)
        .expect(400)
    })
  })

  describe('글', () => {
    test('성공: 좋아요 | 201', async () => {
      await request(app)
        .post(`/interaction/like`)
        .send({ targetType: 'Board', targetInfo: testBoardId })
        .set('Cookie', `access_token=${userToken}`)
        .expect(201)
    })

    test('실패: 적절하지 않은 글 ID에 좋아요 시도 | 400', async () => {
      await request(app)
        .post(`/interaction/like`)
        .send({ targetType: 'Board', targetInfo: '123' })
        .set('Cookie', `access_token=${userToken}`)
        .expect(400)
    })

    test('실패: 존재하지 않는 글 ID에 좋아요 시도 | 400', async () => {
      await request(app)
        .post(`/interaction/like`)
        .send({ targetType: 'Board', targetInfo: invalidId })
        .set('Cookie', `access_token=${userToken}`)
        .expect(404)
    })

    test('성공: 좋아요 해제 | 200', async () => {
      await request(app)
        .delete(`/interaction/like`)
        .send({ targetType: 'Board', targetInfo: testBoardId })
        .set('Cookie', `access_token=${userToken}`)
        .expect(200)
    })

    test('실패: 적절하지 않은 글 ID에 좋아요 해제 시도 | 400', async () => {
      await request(app)
        .delete(`/interaction/like`)
        .send({ targetType: 'Board', targetInfo: '123' })
        .set('Cookie', `access_token=${userToken}`)
        .expect(400)
    })

    test('실패: 존재하지 않는 글 ID에 좋아요 해제 시도 | 400', async () => {
      await request(app)
        .delete(`/interaction/like`)
        .send({ targetType: 'Board', targetInfo: invalidId })
        .set('Cookie', `access_token=${userToken}`)
        .expect(404)
    })
  })

  describe('피드백', () => {
    test('성공: 좋아요 | 201', async () => {
      await request(app)
        .post(`/interaction/like`)
        .send({ targetType: 'Feedback', targetInfo: testFeedbackId })
        .set('Cookie', `access_token=${userToken}`)
        .expect(201)
    })

    test('실패: 적절하지 않은 피드백 ID에 좋아요 시도 | 400', async () => {
      await request(app)
        .post(`/interaction/like`)
        .send({ targetType: 'Feedback', targetInfo: '123' })
        .set('Cookie', `access_token=${userToken}`)
        .expect(400)
    })

    test('실패: 존재하지 않는 피드백 ID에 좋아요 시도 | 400', async () => {
      await request(app)
        .post(`/interaction/like`)
        .send({ targetType: 'Feedback', targetInfo: invalidId })
        .set('Cookie', `access_token=${userToken}`)
        .expect(404)
    })

    test('성공: 좋아요 해제 | 200', async () => {
      await request(app)
        .delete(`/interaction/like`)
        .send({ targetType: 'Feedback', targetInfo: testFeedbackId })
        .set('Cookie', `access_token=${userToken}`)
        .expect(200)
    })

    test('실패: 적절하지 않은 피드백 ID에 좋아요 해제 시도 | 400', async () => {
      await request(app)
        .delete(`/interaction/like`)
        .send({ targetType: 'Feedback', targetInfo: '123' })
        .set('Cookie', `access_token=${userToken}`)
        .expect(400)
    })

    test('실패: 존재하지 않는 피드백 ID에 좋아요 해제 시도 | 400', async () => {
      await request(app)
        .delete(`/interaction/like`)
        .send({ targetType: 'Feedback', targetInfo: invalidId })
        .set('Cookie', `access_token=${userToken}`)
        .expect(404)
    })
  })

  describe('댓글', () => {
    test('성공: 좋아요 | 201', async () => {
      await request(app)
        .post(`/interaction/like`)
        .send({ targetType: 'Reply', targetInfo: testReplyId })
        .set('Cookie', `access_token=${userToken}`)
        .expect(201)
    })

    test('실패: 적절하지 않은 댓글 ID에 좋아요 시도 | 400', async () => {
      await request(app)
        .post(`/interaction/like`)
        .send({ targetType: 'Reply', targetInfo: '123' })
        .set('Cookie', `access_token=${userToken}`)
        .expect(400)
    })

    test('실패: 존재하지 않는 댓글 ID에 좋아요 시도 | 400', async () => {
      await request(app)
        .post(`/interaction/like`)
        .send({ targetType: 'Reply', targetInfo: invalidId })
        .set('Cookie', `access_token=${userToken}`)
        .expect(404)
    })

    test('성공: 좋아요 해제 | 201', async () => {
      await request(app)
        .delete(`/interaction/like`)
        .send({ targetType: 'Reply', targetInfo: testReplyId })
        .set('Cookie', `access_token=${userToken}`)
        .expect(200)
    })
  })

  test('실패: 적절하지 않은 댓글 ID에 좋아요 해제 시도 | 400', async () => {
    await request(app)
      .delete(`/interaction/like`)
      .send({ targetType: 'Reply', targetInfo: '123' })
      .set('Cookie', `access_token=${userToken}`)
      .expect(400)
  })

  test('실패: 존재하지 않는 댓글 ID에 좋아요 해제 시도 | 400', async () => {
    await request(app)
      .delete(`/interaction/like`)
      .send({ targetType: 'Reply', targetInfo: invalidId })
      .set('Cookie', `access_token=${userToken}`)
      .expect(404)
  })
})

describe('테스트 종료', () => {
  test('S3 오브젝트 삭제 | 200', async () => {
    await request(app).delete(`/boards/${testBoardId}`).set('Cookie', `access_token=${userToken}`).expect(200)
  })
})
