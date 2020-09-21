'use strict'

import dotenv from 'dotenv'
import randomString from 'random-string'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { describe, expect, test } from '@jest/globals'

import { User } from '../../../src/models'
import app from '../../../app'

dotenv.config()

let userToken
let newUserId

describe('유저 테스트', () => {
  // user data
  const tempPw = randomString() + '1!2@3#4$'
  const newPw = randomString() + '!!11@@22'
  const userData = {
    email: randomString() + '@lunarcat.com',
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: 'AwesomeUser',
  }
  const verifiedUserData = {
    email: 'usertest@lunarcat.com',
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: 'Verification',
  }
  const toBeDeletedData = {
    email: 'delete@lunarcat.com',
    userPw: newPw,
    userPwRe: newPw,
    userNick: 'ByeBye',
  }

  // profile data
  const newProfileData = {
    screenId: 'screenidchanged',
    userNick: 'computer2',
    userCountry: 2,
    userLang: [1, 2],
    userIntro: `I'm the greatest writer ever`
  }

  // image data path
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
    // 임시유저 생성
    await request(app).post('/auth/join').send(userData)
    const newUserData = await User.isExist(userData.email)
    newUserId = newUserData._id

    // 이메일 인증된 사용자
    await request(app).post('/auth/join').send(verifiedUserData)
    await User.confirmUser(verifiedUserData.email)
    const verifiedLoginReponse = await request(app).post('/auth/login').send({
      email: verifiedUserData.email,
      userPw: verifiedUserData.userPw,
    })

    userToken = verifiedLoginReponse.body.token
  })

  describe('회원가입 테스트', () => {
    test("성공 | 201", async () => {
      await request(app).post("/auth/join").send({
        email: randomString() + '@lunarcat.com',
        userPw: '1q2w3e4r!!',
        userPwRe: '1q2w3e4r!!',
        userNick: randomString()
      }).expect(201)
    })

    test('실패: 중복 회원가입 시도 | 400', async () => {
      await request(app).post('/auth/join').send(userData)
      const res = await request(app).post('/auth/join').send(userData)

      expect(res.statusCode).toBe(400)
    })
  })

  describe('로그인 테스트', () => {
    test('성공: 인증된 이메일 | 200', async () => {
      const res = await request(app).post('/auth/login').send({
        email: verifiedUserData.email,
        userPw: verifiedUserData.userPw,
      })

      const jwtToken = jwt.verify(res.body.token, process.env.SECRET_KEY)

      expect(res.statusCode).toBe(200)
      expect(jwtToken.isConfirmed).toBeTruthy()
    })

    test('성공: 인증되지 않은 이메일 | 200', async () => {
      const res = await request(app).post('/auth/login').send({
        email: userData.email,
        userPw: userData.userPw,
      })

      const jwtToken = jwt.verify(res.body.token, process.env.SECRET_KEY)

      expect(res.statusCode).toBe(200)
      expect(jwtToken.isConfirmed).toBeFalsy()
    })

    test('실패: 잘못된 비밀번호 | 400', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          userPw: randomString() + '1!2@3#4$',
        })
        .expect(400)
    })

    test('실패: 존재하지 않는 아이디 | 404', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          email: randomString() + '@test.com',
          userPw: randomString() + '1!2@3#4$',
        })
        .expect(404)
    })
  })

  describe.skip('비밀번호 변경', () => {
    test('성공 | 200', async () => {
      await request(app)
        .patch('/user/changePass')
        .set('x-access-token', userToken)
        .send({
          userPw: verifiedUserData.userPw,
          newUserPw: newPw,
          newUserPwRe: newPw,
        })
        .expect(200)
    })

    test('실패: 적절하지 않은 비밀번호 | 400', async () => {
      await request(app)
        .patch('/user/changePass')
        .set('x-access-token', userToken)
        .send({
          userPw: verifiedUserData.userPw,
          userPwNew: '123',
          userPwNewRe: '123',
        })
        .expect(400)
    })

    test('실패: 새로운 비밀번호가 이전 비밀번호와 동일 | 400', async () => {
      await request(app)
        .patch('/user/changePass')
        .set('x-access-token', userToken)
        .send({
          userPw: verifiedUserData.userPw,
          userPwNew: verifiedUserData.userPw,
          userPwNewRe: verifiedUserData.userPw,
        })
        .expect(400)
    })

    test('실패: 새로운 비밀번호와 재입력이 다름 | 400', async () => {
      await request(app)
        .patch('/user/changePass')
        .set('x-access-token', userToken)
        .send({
          userPw: verifiedUserData.userPw,
          userPwNew: verifiedUserData.userPw,
          userPwNewRe: verifiedUserData.userPw + '1',
        })
        .expect(400)
    })
  })

  describe('프로필 변경', () => {
    test.skip('성공: 이전 데이터 불러오기 | 200', async () => {
      const response = await request(app)
        .get('/user/editProfile')
        .set('x-access-token', userToken)

      expect(response.statusCode).toBe(200)
    })

    test.skip('성공: 전체 변경 | 200', async () => {
      const response = await request(app)
        .post('/user/editProfile')
        .set('x-access-token', userToken)
        .field('screenId', newProfileData.screenId)
        .field('userNick', newProfileData.userNick)
        .field('userCountry', newProfileData.userCountry)
        .field('userLang', newProfileData.userLang)
        .field('userIntro', newProfileData.userIntro)
        .attach('userBannerImg', imagePathArray[0])
        .attach('userProfileImg', imagePathArray[1])

      expect(response.statusCode).toBe(200)

      // console.log(response)
    })

    test('성공: 일부 변경 | 200', async () => {
      const response = await request(app)
        .post('/user/editProfile')
        .set('x-access-token', userToken)
        .field('screenId', 'partialChange')
        // .field('userNick', newProfileData.userNick)
        // .field('userCountry', newProfileData.userCountry)
        .field('userLang', newProfileData.userLang[0])
        .field('userIntro', newProfileData.userIntro)
        .attach('userBannerImg', imagePathArray[0])
        // .attach('userProfileImg', imagePathArray[1])

      expect(response.statusCode).toBe(200)
      
      // console.log(response)
    })
  })

  describe.skip('회원 탈퇴', () => {
    test('성공 | 200', async () => {
      await request(app).post('/auth/join').send(toBeDeletedData)
      await User.confirmUser(toBeDeletedData.email)

      const res = await request(app).post('/auth/login').send(toBeDeletedData)

      await request(app)
        .delete('/user')
        .set('x-access-token', res.body.token)
        .send({
          userPw: newPw,
        })
        .expect(200)
    })
  })
})
