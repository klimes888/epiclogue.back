"use strict";
require("dotenv").config();

import randomString from "random-string";
import request from "supertest";
import jwt from 'jsonwebtoken'
import User from "../../../models/users";

const app = require("../../../app");

let newUserId;
let verifiedToken;

describe("유저 테스트", () => {
  const tempPw = randomString() + "1!2@3#4$";

  const userData = {
    email: randomString() + "@lunarcat.com",
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: randomString(),
  };
  const verifiedUserData = {
    email: "usertest@lunarcat.com",
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: randomString(),
  };

  beforeAll(async () => {
    // 임시유저 생성
    await request(app).post("/users/join").send(userData);
    const newUserData = await User.isExist(userData.email);
    newUserId = newUserData._id;

    // 이메일 인증된 사용자
    await request(app).post("/users/join").send(verifiedUserData);
    await User.confirmUser(verifiedUserData.email);
    const verifiedLoginReponse = await request(app).post("/users/login").send({
      email: verifiedUserData.email,
      userPw: verifiedUserData.userPw,
    });

    verifiedToken = verifiedLoginReponse.body.token;
  });

  describe('회원가입 테스트 | 201', () => {
    // node mailer 문제로 진행하지 않음
    // test("성공 | 201", async () => {
    //   await request(app).post("/users/join").send({
    //     email: randomString() + 'lunarcat.com',
    //     userPw: '1q2w3e4r!!',
    //     userPwRe: '1q2w3e4r!!',
    //     userNick: randomString()
    //   }).expect(201)
    // })    

    test("실패: 중복 회원가입 시도 | 400", async() => {
      await request(app).post("/users/join").send(userData);
      const res = await request(app).post("/users/join").send(userData);

      expect(res.statusCode).toBe(400)
    })
  })

  describe('로그인 테스트', () => {
    test("성공: 인증된 이메일 | 200", async () => {
      const res = await request(app).post("/users/login").send({
        email: verifiedUserData.email,
        userPw: verifiedUserData.userPw,
      });

      const jwtToken = jwt.verify(res.body.token, process.env.SECRET_KEY);

      expect(res.statusCode).toBe(200);
      expect(jwtToken.isConfirmed).toBeTruthy();
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

  describe('비밀번호 변경', () => {
    test('성공 | 200', async() => {
      const res = await request(app).post('/users/changePass').set("x-access-token", verifiedToken).send({
        userPw: verifiedUserData.userPw, userPwNew: 'geno1q2w3e4r!', userPwNewRe: 'geno1q2w3e4r!'
      })

      console.log(res.body);

      expect(res.statusCode).toBe(200)
    })

    test('실패: 적절하지 않은 비밀번호 | 400', async() => {
      await request(app).post('/users/changePass').set("x-access-token", verifiedToken).send({
        userPw: verifiedUserData.userPw, userPwNew: '123', userPwNewRe: '123'
      }).expect(400)
    })

    test('실패: 새로운 비밀번호가 이전 비밀번호와 동일 | 400', async() => {
      await request(app).post('/users/changePass').set("x-access-token", verifiedToken).send({
        userPw: verifiedUserData.userPw, userPwNew: verifiedUserData.userPw, userPwNewRe: verifiedUserData.userPw
      }).expect(400)
    })

    test('실패: 새로운 비밀번호와 재입력이 다름 | 400', async() => {
      await request(app).post('/users/changePass').set("x-access-token", verifiedToken).send({
        userPw: verifiedUserData.userPw, userPwNew: verifiedUserData.userPw, userPwNewRe: verifiedUserData.userPw + '1'
      }).expect(400)
    })
  })

});
