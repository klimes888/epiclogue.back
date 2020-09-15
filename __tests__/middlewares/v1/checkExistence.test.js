import request from 'supertest'
import randomString from 'random-string'
import fs from 'fs'
import path from 'path'

import { User } from '../../../src/models'
import app from '../../../app'

describe('데이터 유효성 테스트', () => {
  // dataset
  const tempPw = randomString() + '1!2@3#4$'
  const verifiedData = {
    email: randomString() + '@lunarcat.com',
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: randomString(),
  }
  let userToken
  const invalidId = '012345678901234567890123'
  let boardId
  let feedbackId
  let replyId

  beforeAll(async () => {
    await request(app).post('/auth/join').send(verifiedData)
    await User.confirmUser(verifiedData.email)
  })

  describe('글 유효성', () => {
    // image path settings
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

    test('존재 | 200', async () => {
      const loginResponse = await request(app).post('/auth/login').send({
        email: verifiedData.email,
        userPw: verifiedData.userPw,
      })
      userToken = loginResponse.body.token

      const uploadInstance = await request(app)
        .post('/boards')
        .set('x-access-token', userToken)
        .field('boardTitle', 'validation')
        .field('boardBody', 'testing')
        .field('category', 'Illust')
        .field('pub', 2)
        .field('language', 'Korean')

      for (let path of imagePathArray) {
        uploadInstance.attach('boardImg', path)
      }

      await uploadInstance.expect(201)

      const createdBoardData = JSON.parse(uploadInstance.res.text)
      testBoardId = createdBoardData.data._id

      await request(app).get(`/boards/${boardId}`).expect(200)
    })

    test('부재 | 404', async () => {
      const loginResponse = await request(app).post('/auth/login').send({
        email: verifiedData.email,
        userPw: verifiedData.userPw,
      })
      userToken = loginResponse.body.token
      await request(app).get(`/boards/${invalidId}`).set('x-access-token', userToken).expect(404)
    })
  })

  describe('피드백 유효성', () => {
    const feedbackBody = 'feedback body ever'

    test('존재 | 200', async () => {
      const loginResponse = await request(app).post('/auth/login').send({
        email: verifiedData.email,
        userPw: verifiedData.userPw,
      })
      userToken = loginResponse.body.token

      const feedbackInstance = await request(app)
        .post(`/boards/${boardId}/feedback`)
        .set('x-access-token', userToken)
        .send(feedbackBody)
        .expect(201)

      const feedbackData = JSON.parse(feedbackInstance.res.text)
      console.log(feedbackData)
      // feedbackId = feedbackData.data[feedbackData.size - 1]._id
    })
  })

  // describe('댓글 유효성', () => {})
})
