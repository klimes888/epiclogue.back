'use strict'

import dotenv from 'dotenv'
import randomString from 'random-string'
import request from 'supertest'
import jwt from 'jsonwebtoken'

import User from '../../../src/models/users'
import app from '../../../app'

dotenv.config()

beforeAll(() => {})

describe('토큰기반 인증 테스트', () => {
  const tempPw = randomString(8) + '1234!@#$';
  const userData = {
    email: randomString() + '@lunarcat.com',
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: randomString()
  }
  const verifiedUserData = {
    email: 'verify@lunarcat.com',
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: randomString()
  }  

  beforeAll(async() => {
    await request(app).post('/users/join').send(verifiedUserData)
    await User.confirmUser(verifiedUserData.email)
  })

  describe('권한 검사 테스트', () => {
    test('이메일 인증된 토큰 | 200', async() => {
      const res = await request(app).post('/users/login').send({
        email: verifiedUserData.email, userPw: verifiedUserData.userPw
      }).expect(200)

      const decodedJWT = jwt.verify(res.body.token, process.env.SECRET_KEY)
      
      expect(decodedJWT.isConfirmed).toBeTruthy()
    })

    test('이메일 인증되지 않은 토큰 | 400', async() => {
      await request(app).post('/users/join').send(userData);
      const res = await request(app).post('/users/login').send({
        email: userData.email, userPw: userData.userPw
      })

      const decodedJWT = jwt.verify(res.body.token, process.env.SECRET_KEY)

      expect(decodedJWT.isConfirmed).toBeFalsy();
    })
  })
})

