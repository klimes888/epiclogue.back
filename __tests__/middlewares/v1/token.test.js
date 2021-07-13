import dotenv from 'dotenv'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { describe, expect, test } from '@jest/globals'

import { cookieParser } from '../../configs/cookieParser'
import { confirmUser } from '../../../src/DAO/user'
import app from '../../../src/app'

dotenv.config()

// beforeAll(() => {})

describe('토큰 테스트', () => {
  const userData = {
    email: 'token@lunarcat.com',
    userPw: 'lunarcat1!2@3#4$',
    userPwRe: 'lunarcat1!2@3#4$',
    userNick: 'token',
    userLang: 1,
  }

  const verifiedUserData = {
    email: 'tokenverify@lunarcat.com',
    userPw: 'lunarcat1!2@3#4$',
    userPwRe: 'lunarcat1!2@3#4$',
    userNick: 'tokenman',
    userLang: 1,
  }

  let userToken
  let screenId // 인증 유저만 가능한 접근을 위해 screenId 사용

  // eslint-disable-next-line no-undef
  beforeAll(async () => {
    // 회원가입 및 메일인증 처리
    await request(app).post('/auth/join').send(verifiedUserData)
    await confirmUser(verifiedUserData.email)
    
    // 로그인 시도 후 액세스 토큰 취득
    const loginResponse = await request(app).post('/auth/login').send(verifiedUserData)
    const cookies = cookieParser(loginResponse.headers['set-cookie'])

    userToken = cookies[0].access_token
    screenId = loginResponse.body.data.screenId

    console.warn(`[Test] Testing token.test.js with userToken: ${userToken} and screenId: ${screenId}`)
  })

  describe('토큰 검사', () => {
    test('성공 | 200', async () => {
      const tokenTestRequest = await request(app)
        .get(`/interaction/bookmark?screenId=${screenId}`)
        .set('Cookie', `access_token=${userToken}`)

      expect(tokenTestRequest.statusCode).toEqual(200)
    })

    test('실패: 인증 토큰 누락 | 401', async () => {
      await request(app).get(`/interaction/bookmark?screenId=${screenId}`).expect(401)
    })

    test('실패: 손상된 인증 토큰 | 401', async () => {
      await request(app)
        .get(`/interaction/bookmark?screenId=${screenId}`)
        .set('Cookie', `access_token=${userToken}`)
        .expect(401)
    })
  })

  describe('권한 검사 테스트', () => {
    test('성공: 이메일 인증된 토큰 | 200', async () => {
      const decodedJWT = jwt.verify(userToken, process.env.SECRET_KEY)

      expect(decodedJWT.isConfirmed).toBeTruthy()
    })

    test('실패: 이메일 인증되지 않은 토큰 | 400', async () => {
      await request(app).post('/auth/join').send(userData)
      const res = await request(app).post('/auth/login').send({
        email: userData.email,
        userPw: userData.userPw,
      })

      const decodedJWT = jwt.verify(cookieParser(res.headers['set-cookie'])[0].access_token, process.env.SECRET_KEY)

      expect(decodedJWT.isConfirmed).toBeFalsy()
    })
  })
})
