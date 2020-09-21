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

describe('피드백 테스트', () => {
  // user data
  const tempPw = randomString() + '1!2@3#4$'
  const userData = {
    email: 'feedbacktest@lunarcat.com',
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: 'boardWriter',
  }
  const invalidId = '012345678901234567890123'
  let userToken
  let testBoardId
  let testFeedbackId

  // board data
  const boardData = {
    boardTitle: 'a board Title',
    boardBody: 'a board Body',
    category: 'Illust',
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
    // join and login
    await request(app).post('/auth/join').send(userData)
    await User.confirmUser(userData.email)
    const loginInstance = await request(app).post('/auth/login').send(userData)
    userToken = loginInstance.body.token
    // console.log(userToken) // ok
  })

  describe('피드백 작성', () => {
    test('선수: 글 작성 | 201', async () => {
      const uploadInstance = await request(app)
        .post('/boards')
        .set('x-access-token', userToken)
        .field('boardTitle', boardData.boardTitle)
        .field('boardBody', boardData.boardBody)
        .field('category', boardData.category)
        .field('pub', boardData.pub)
        .field('language', boardData.language)
        .attach('boardImg', imagePathArray[0])

      const uploadRes = JSON.parse(uploadInstance.res.text)
      testBoardId = uploadRes.data._id

      // console.log(testBoardId) // ok
    })

    test('성공 | 201', async () => {
      const rawResponse = await request(app)
        .post(`/boards/${testBoardId}/feedback`)
        .set('x-access-token', userToken)
        .send({ feedbackBody: 'feedback body ever seen!' })

      // extract feedbackId
      const extractedResponse = JSON.parse(rawResponse.res.text)
      testFeedbackId = extractedResponse.data[0]._id
      // console.log(testFeedbackId) // ok
    })
  })

  describe('피드백 읽기', () => {
    test('성공 | 200', async () => {
      const response = await request(app)
        .get(`/boards/${testBoardId}/feedback/${testFeedbackId}`)
        .set('x-access-token', userToken)

      expect(response.statusCode).toBe(200)
    })

    test('실패: 존재하지 않는 피드백 | 404', async () => {
      const response = await request(app)
        .get(`/boards/${testBoardId}/feedback/${invalidId}`)
        .set('x-access-token', userToken)

      expect(response.statusCode).toBe(404)
    })
  })

  describe('피드백 수정', () => {
    test('성공 | 200', async () => {
      const response = await request(app)
        .patch(`/boards/${testBoardId}/feedback/${testFeedbackId}`)
        .set('x-access-token', userToken)
        .send({ newFeedbackBody: 'feedback has been changed? ' })

      expect(response.statusCode).toBe(200)
    })

    test('실패: 존재하지 않는 피드백 | 404', async () => {
      const response = await request(app)
        .patch(`/boards/${testBoardId}/feedback/${invalidId}`)
        .set('x-access-token', userToken)

      expect(response.statusCode).toBe(404)
    })
  })

  describe('피드백 삭제', () => {
    test('성공 | 200', async () => {
      const response = await request(app)
        .delete(`/boards/${testBoardId}/feedback/${testFeedbackId}`)
        .set('x-access-token', userToken)

      expect(response.statusCode).toBe(200)
    })

    test('실패: 존재하지 않는 피드백 | 404', async () => {
      const response = await request(app)
        .delete(`/boards/${testBoardId}/feedback/${invalidId}`)
        .set('x-access-token', userToken)

      expect(response.statusCode).toBe(404)
    })
  })

  describe('테스트 종료', () => {
    test('S3 오브젝트 삭제 | 200', async () => {
      await request(app).delete(`/boards/${testBoardId}`).set('x-access-token', userToken).expect(200)
    })
  })
})