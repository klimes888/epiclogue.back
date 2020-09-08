'use strict'

import dotenv from 'dotenv'
import request from 'supertest'
import fs from 'fs'
import randomString from 'random-string'
import FormData from 'form-data'
import path from 'path'

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
  let boardFormData = new FormData()

  // board dataset
  const boardData = {
    boardTitle: "a board Title",
    boardBody: "a board Body",
    category: "Illust",
    pub: "true",
    language: "Korean",
  };

  // if form-data
  boardFormData.append('boardTitle', 'a board Title')
  boardFormData.append('boardBody', 'a board Body ever')
  boardFormData.append('category', 'Illust')
  boardFormData.append('pub', 'true')
  boardFormData.append('language', 'korean')
  
  const imgFiles = [];
  const imgPath = path.join(__dirname + '/testImages');
    fs.readdir(imgPath, (err, files) => {
      if (err) {
        console.error(err)
      }
      files.forEach(name => {
        imgFiles.push(fs.readFileSync(imgPath + '/' + name))
        boardFormData.append('boardImg', fs.readFileSync(imgPath + '/' + name))
      });
      // console.log(imgFiles) // Got image buffers
    })

  beforeAll(async () => {
    await request(app).post("/auth/join").send(writerData);
    await request(app).post("/auth/join").send(nonWriterData);
    await User.confirmUser(writerData.email);
    await User.confirmUser(nonWriterData.email);
  });

  describe("글 쓰기", () => {
    test("성공 | 200", async () => {
      const writerLoginResponse = await request(app)
        .post("/auth/login")
        .send(writerData);

      writerAuthToken = writerLoginResponse.body.token;

      await request(app)
        .post("/boards")
        .set({"x-access-token": writerAuthToken})
        .field("boardTitle", boardData.boardTitle)
        .field("boardBody", boardData.boardBody)
        .field("category", boardData.category)
        .field("pub", boardData.pub)
        .field("language", boardData.language)
        .attach('boardImg', imgFiles[0])
        .attach('boardImg', imgPath + '/node.png')
        .attach('boardImg', fs.createReadStream(imgPath + '/node.png'))
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