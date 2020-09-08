'use strict'

import dotenv from 'dotenv'
import request from 'supertest'
import fs from 'fs'
import randomString from 'random-string'
import FormData from 'form-data'

import User from '../../../src/models/users'
import Board from '../../../src/models/board'
import app from '../../../app'

dotenv.config()

beforeAll(() => {})

describe("글 테스트", () => {
  // user datasets
  const tempPw = randomString() + "1!2@3#4$";
  const writerData = {
    email: "writerdata@lunarcat.com",
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: "boardWriter",
  };
  const nonWriterData = {
    email: "nonwriterdata@lunarcat.com",
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: "boardtester",
  };
  let writerAuthToken;
  let nonWriterDataToken;

  // board dataset
  const boardData = {
    boardTitle: "a board Title",
    boardBody: "a board Body",
    category: "Illust",
    pub: "true",
    language: "Korean",
  };

  beforeAll(async () => {
    await request(app).post("/users/join").send(writerData);
    await request(app).post("/users/join").send(nonWriterData);
    await User.confirmUser(writerData.email);
    await User.confirmUser(nonWriterData.email);
  });

  describe("글 쓰기", () => {
    test("성공 | 200", async () => {
      const writerLoginResponse = await request(app)
        .post("/users/login")
        .send(writerData);

      writerAuthToken = writerLoginResponse.body.token;

      console.log(writerAuthToken)

      await request(app)
        .post("/boards")
        .set("x-access-token", writerAuthToken)
        .attach('boardImg', fs.createReadStream(__dirname + '/images/node.png'))
        .field("boardTitle", boardData.boardTitle)
        .field("boardBody", boardData.boardBody)
        .field("category", boardData.category)
        .field("pub", boardData.pub)
        .field("language", boardData.language)
        .expect(201);
    });
  });

  // describe("글 읽기", async() => {

  // })

  // describe("글 수정", async() => {

  // })

  // describe("글 삭제", async() => {

  // })
})