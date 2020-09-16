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
  const invalidBoardId = '012345678901234567890123'
  let userToken
  let testBoardId

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
  })

  describe('피드백 작성', () => {
    test('글 작성 | 201', async () => {
      const loginInstance = await request(app).post('/auth/login').send(userData)

      userToken = loginInstance.body.token

      // create board
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
      console.log(uploadRes)
    })
  })
})