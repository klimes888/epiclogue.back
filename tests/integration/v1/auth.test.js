require('dotenv').config()

import randomString from 'random-string'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import User from '../../../models/users'
import util from 'util'
import crypto from 'crypto'
import mongoose from 'mongoose'

const app = require('../../../app')

/* 
 * 유저 인증테스트 목록
 * 1. 회원가입
 *   1.1 성공
 *   1.2 실패
 *     1.2.1 존재하는 이메일
 *     1.2.2 비밀번호 규칙 미준수
 *     1.2.3 비밀번호 불일치
 * 
 * 2. 로그인
 *   2.1 성공
 *   2.2 실패
 *     2.2.1 존재하지 않는 아이디
 *     2.2.2 이메일 미인증
 * 
 * 3. 권한 auth (UD)
 *   3.1 글
 *   3.2 피드백
 *   3.3 대댓글
 *   3.4 
*/

beforeAll( done => done() )

describe('유저 인증 테스트 GET/POST /users', () => {
  const tempPw = randomString(8) + '1234!@#$';
  const userData = {
    email: randomString() + '@lunarcat.com',
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: randomString()
  }  
  let userObject
  let verifiedData 

  beforeAll( async() => {
    userObject = await request(app).post('/users/join').send(userData)
    verifiedData = await request(app).post('/users/login').send({
      email: 'dodgeplay', userPw: 'wpshtkdlem1!'
    })
  })

  describe('로그인 테스트', () => {

    test("성공 | 200", async () => {
      const res = await request(app).post("/users/login").send({
        email: userData.email,
        userPw: userData.userPw,
      });

      const jwtToken = jwt.verify(res.body.token, process.env.SECRET_KEY);

      expect(userData.email).toBe(res.body.email);
      expect(res.statusCode).toBe(200);
    });

    test("성공: 인증되지 않은 이메일 | 200", async () => {
      const res = await request(app).post("/users/login").send({
        email: userData.email,
        userPw: userData.userPw,
      });

      const jwtToken = jwt.verify(res.body.token, process.env.SECRET_KEY);

      expect(res.statusCode).toBe(200);
      expect(jwtToken.isConfirmed).toBeFalsy();
    });

    test('실패: 존재하지 않는 아이디 | 400', async() => {
      const res = await request(app).post('/users/login').send({
        email: randomString() + '@lunarcat.com', userPw: randomString()
      })

      expect(res.statusCode).toBe(400)
    })



    
  })
})

afterAll(() => mongoose.disconnect())