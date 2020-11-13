'use strict'

import dotenv from 'dotenv'
import request from 'supertest'
import fs from 'fs'
import randomString from 'random-string'
import path from 'path'
import { describe, expect, test } from '@jest/globals'

import { User } from '../../../src/models'

import app from '../../../app'

dotenv.config()

// beforeAll()

describe('글 테스트', () => {
  // user datasets
  const tempPw = randomString() + '1!2@3#4$'
  const writerData = {
    email: 'boardtest@lunarcat.com',
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: 'boardWriter',
  }
  const invalidBoardId = '012345678901234567890123'
  let userToken
  let testBoardId

  // board dataset
  const boardData = {
    boardTitle: 'a board Title',
    boardBody: 'a board Body',
    category: 0,
    pub: 1,
    language: 'Korean',
  }

  const imgPath = path.join(__dirname + '/../../testImages')
  const imagePathArray = []
  fs.readdir(imgPath, (err, files) => {
    if (err) {
      console.error(err)
    }
    files.forEach(name => {
      imagePathArray.push(imgPath + '/' + name)
    })
  })

  beforeAll(async () => {
    await request(app).post('/auth/join').send(writerData)
    await User.confirmUser(writerData.email)
    const writerLoginResponse = await request(app).post('/auth/login').send(writerData)
    userToken = writerLoginResponse.body.token
  })

  describe('글 쓰기', () => {
    test('성공 | 201', async () => {
      const uploadInstance = request(app)
        .post('/boards')
        .set('x-access-token', userToken)
        .field('boardTitle', boardData.boardTitle)
        .field('boardBody', boardData.boardBody)
        .field('category', boardData.category)
        .field('pub', boardData.pub)
        .field('language', boardData.language)

      for (let path of imagePathArray) {
        uploadInstance.attach('boardImg', path)
      }

      await uploadInstance.expect(201)
      // JSON object로 직렬화 하지 않으면 데이터로 사용할 수 없으며, object까지의 json.parse 이후에 접근하여야 함 ( JSON.parse(uploadInstance.res.text.data) 의 접근이 불가능)
      const createdBoardData = JSON.parse(uploadInstance.res.text)
      testBoardId = createdBoardData.data._id
    })

    test('실패: 이미지 누락 | 400', async () => {
      await request(app)
        .post('/boards')
        .set('x-access-token', userToken)
        .field('boardTitle', boardData.boardTitle)
        .field('boardBody', boardData.boardBody)
        .field('category', boardData.category)
        .field('pub', boardData.pub)
        .field('language', boardData.language)
        .expect(400)

        /* Images are not contained */
    })

    test('실패: 필수 속성 누락 | 400', async () => {
      const uploadInstance = request(app)
        .post('/boards')
        .set('x-access-token', userToken)
        .field('boardTitle', boardData.boardTitle)
        .field('boardBody', boardData.boardBody)
        // .field('category', boardData.category)
        // .field('pub', boardData.pub)
        .field('language', boardData.language)

      for (let path of imagePathArray) {
        uploadInstance.attach('boardImg', path)
      }

      await uploadInstance.expect(400)
    })
  })

  describe('글 읽기', () => {
    test('성공 | 200', async () => {
      await request(app)
        .get(`/boards/${testBoardId}`)
        .set('x-access-token', userToken)
        .expect(200)
    })

    test('실패: 존재하지 않는 글 | 404', async () => {
      await request(app)
        .get(`/boards/${invalidBoardId}`)
        .set('x-access-token', userToken)
        .expect(404)
    })
  })

  describe('글 수정', () => {
    test('성공: 이전 정보 불러오기 | 200', async () => {
      await request(app)
        .get(`/boards/${testBoardId}/edit`)
        .set('x-access-token', userToken)
        .expect(200)
    })

    test('성공: 정상적인 수정 | 200', async () => {
      const uploadInstance = request(app)
        .post(`/boards/${testBoardId}/edit`)
        .set('x-access-token', userToken)
        .field('boardTitle', 'edited')
        .field('boardBody', 'edited')
        .field('category', 1)
        .field('pub', 0)
        .field('language', 'Japanese')

      for (let path of imagePathArray) {
        uploadInstance.attach('boardImg', path)
      }

      await uploadInstance.expect(200)
    })

    test('실패: 존재하지 않는 boardId | 200', async () => {
      const uploadInstance = request(app)
        .post(`/boards/${invalidBoardId}/edit`)
        .set('x-access-token', userToken)
        .field('boardTitle', 'edited')
        .field('boardBody', 'edited')
        .field('category', 1)
        .field('pub', 0)
        .field('language', 'Japanese')

      for (let path of imagePathArray) {
        uploadInstance.attach('boardImg', path)
      }

      await uploadInstance.expect(404)
    })
  })

  describe('글 삭제', () => {
    test('성공 | 200', async () => {
      await request(app)
        .delete(`/boards/${testBoardId}`)
        .set('x-access-token', userToken)
        .expect(200)
    })

    test('실패: 올바르지 않은 boardId | 400', async () => {
      await request(app)
        .delete(`/boards/123`)
        .set('x-access-token', userToken)
        .expect(400)
    })

    test('실패: 존재하지 않는 boardId | 400', async () => {
      await request(app)
        .delete(`/boards/${invalidBoardId}`)
        .set('x-access-token', userToken)
        .expect(404)
    })
  })
})
