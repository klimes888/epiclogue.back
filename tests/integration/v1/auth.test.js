require('dotenv').config()

import randomString from 'random-string'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const app = require('../../../app')

/* 
 * 토큰기반 인증 테스트
 * 1. 로그인
 *   2.1 성공
 *   2.2 실패
 *     2.2.1 존재하지 않는 아이디
 *     2.2.2 이메일 미인증
 * 
 * 2. 권한검사 (수정 삭제)
 *   3.1 글
 *   3.2 피드백
 *   3.3 대댓글
 *   3.4 
*/

beforeAll( done => done() )

describe('토큰기반 인증 테스트', () => {
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

  describe('회원가입 테스트', () => {
    test("성공 | 200", async () => {
      const res = await request(app).post("/users/join").send(userData);

      expect(res.statusCode).toBe(201)
    })    
  })

  describe('로그인 테스트', () => {
    test("정상 로그인 성공 | 200", async () => {
      const res = await request(app).post("/users/login").send({
        email: userData.email,
        userPw: userData.userPw,
      });

      const jwtToken = jwt.verify(res.body.token, process.env.SECRET_KEY);

      expect(jwtToken.email).toBe(res.body.email);
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

  describe('권한 검사 테스트', () => {

  })

})

afterAll(() => mongoose.disconnect())