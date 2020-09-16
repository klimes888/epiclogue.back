'use strict'

import dotenv from 'dotenv'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { describe, expect, test } from '@jest/globals'

import { User } from '../../../src/models'
import app from '../../../app'

dotenv.config()

// beforeAll(() => {})

describe('토큰기반 인증 테스트', () => {
  const userData = {
    email: 'token@lunarcat.com',
    userPw: 'lunarcat1!2@3#4$',
    userPwRe: 'lunarcat1!2@3#4$',
    userNick: 'token',
  }
  const verifiedUserData = {
    email: 'tokenverify@lunarcat.com',
    userPw: 'lunarcat1!2@3#4$',
    userPwRe: 'lunarcat1!2@3#4$',
    userNick: 'tokenman',
  }

  beforeAll(async () => {
    await request(app).post('/auth/join').send(verifiedUserData)
    await User.confirmUser(verifiedUserData.email)
  })

  describe('권한 검사 테스트', () => {
    test('이메일 인증된 토큰 | 200', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: verifiedUserData.email,
          userPw: verifiedUserData.userPw,
        })
        .expect(200)

      const decodedJWT = jwt.verify(res.body.token, process.env.SECRET_KEY)

      expect(decodedJWT.isConfirmed).toBeTruthy()
    })

    test('이메일 인증되지 않은 토큰 | 400', async () => {
      await request(app).post('/auth/join').send(userData)
      const res = await request(app).post('/auth/login').send({
        email: userData.email,
        userPw: userData.userPw,
      })

      const decodedJWT = jwt.verify(res.body.token, process.env.SECRET_KEY)

      expect(decodedJWT.isConfirmed).toBeFalsy()
    })
  })
})
