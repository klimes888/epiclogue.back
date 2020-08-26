require('dotenv').config()

import randomString from 'random-string'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

import User from '../../../models/users'

const app = require('../../../app')

/* 
 * 유저 테스트
 * 1. 팔로우
 *   1.1 팔로우 성공
 *   1.2 언팔로우 성공
 *   1.3 없는 유저에게 팔로우
 * 
 * (미정)
 * 2. 뮤트
 * 3. 차단
 */


let newUserId;
let verifiedToken
const invalidId = "123456789012345678901234"

describe('유저 테스트', async () => {
  beforeAll(async() => {
    const tempPw = randomString() + "1!2@3#4$"
    
    // 임시 유저
    const userData = {
      email: randomString() + '@lunarcat.com',
      userPw: tempPw,
      userPwRe: tempPw,
      userNick: randomString()
    }
        
    await request(app).post('/users/join').send(userData)
    const newUserData = await User.isExist(userData.email);
    newUserId = newUserData._id

    // 이메일 인증 사용자(팔로우 수행자)
    const verifiedUserData = {
      email: 'verify@lunarcat.com',
      userPw: tempPw,
      userPwRe: tempPw,
      userNick: randomString()
    }  

    const verifiedLoginReponse = await request(app).post('/users/login').send(verifiedUserData)
    
    verifiedToken = verifiedLoginReponse.body.token
  })

  describe("팔로우 테스트", () => {
    test("팔로우 성공 | 201", async () => {
      await request(app)
        .post(`/SCREENID/follow`)
        .send({ targetUserId: newUserId })
        .set("x-access-token", verifiedToken)
        .expect(201)
    });

    test("언팔로우 성공 | 200", async () => {
      await request(app)
        .delete('/SCREENID/follow')
        .send({ targetUserId: newUserId })
        .set("x-access-token", verifiedToken)
        .expect(200)
    })

    test("팔로우 실패: 없는 아이디에 접근", async () => {
      await request(app)
        .post(`/SCREENID/follow`)
        .send({ targetUserId: invalidId })
        .set("x-access-token", verifiedToken)
        .expect(400)
    })
  });
})

afterAll(() => mongoose.disconnect())