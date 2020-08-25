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
  })

  /* 메일 문제로 테스트 진행하지 않음. 특정 환경에서는 정상적으로 작동. */
  // describe('회원가입 테스트', () => {
  //   test("성공 | 201", async () => {
  //     const res = await request(app).post("/users/join").send(userData);

  //     expect(res.statusCode).toBe(201)
  //   })    

  //   test("실패: 중복 회원가입 시도", async() => {
  //     const res = await request(app).post("/users/join").send(userData);

  //     expect(res.statusCode).toBe(400)
  //   })
  // })

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


    /* 
    함수가 하나밖에 없는데 아래의 오류가 떠서 async-await 사용

    A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --runInBand --detectOpenHandles to find leaks.
    */
    test("실패: 잘못된 비밀번호 | 400", async () => {
      await request(app)
        .post("/users/login")
        .send({
          email: userData.email,
          userPw: randomString(),
        })
        .expect(400);
    });

    test("실패: 존재하지 않는 아이디 | 400", async () => {
      await request(app)
        .post("/users/login")
        .send({
          email: randomString() + "@test.com",
          userPw: randomString(),
        })
        .expect(400);
    });
  })

  describe('권한 검사 테스트', () => {
    test('이메일 인증된 로그인', async() => {
      const res = await request(app).post('/users/login').send({
        email: 'taypark2020@gmail.com', userPw: '1q2w3e4r!!'
      })

      const decodedJWT = jwt.verify(res.body.token, process.env.SECRET_KEY)
      
      expect(decodedJWT.isConfirmed).toBeTruthy()
    })
  })

})

afterAll(() => mongoose.disconnect())