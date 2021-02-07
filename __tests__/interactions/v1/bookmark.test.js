import dotenv from 'dotenv';
import randomString from 'random-string';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { describe, expect, test } from '@jest/globals';

import { User } from '../../../src/models';
import app from '../../../app';

dotenv.config();

let userToken;
let screenId;
const invalidId = '123456789012345678901234';
let testBoardId;

describe('북마크 테스트', () => {
  const tempPw = `${randomString()}1!2@3#4$`;
  const userData = {
    email: 'bookmark@lunarcat.com',
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: randomString(),
    userLang: 0,
  };

  const boardData = {
    boardTitle: 'a board Title',
    boardBody: 'a board Body',
    category: 0,
    pub: 1,
    language: 'Korean',
  };

  const imgPath = path.join(`${__dirname}/../../testImages`);
  const imagePathArray = [];
  fs.readdir(imgPath, (err, files) => {
    if (err) {
      console.error(err);
    }
    files.forEach(name => {
      imagePathArray.push(`${imgPath}/${name}`);
    });
  });

  // eslint-disable-next-line no-undef
  beforeAll(async () => {
    await request(app).post('/auth/join').send(userData);
    await User.confirmUser(userData.email);
    const verifiedLoginReponse = await request(app).post('/auth/login').send(userData);
    const rawUserData = await User.isExist(userData.email);

    screenId = rawUserData.screenId;
    userToken = verifiedLoginReponse.body.token;
  });

  describe('북마크 테스트', () => {
    describe('선수 작업', () => {
      test('글 작성 | 201', async () => {
        const uploadInstance = await request(app)
          .post('/boards')
          .set('x-access-token', userToken)
          .field('boardTitle', boardData.boardTitle)
          .field('boardBody', boardData.boardBody)
          .field('category', boardData.category)
          .field('pub', boardData.pub)
          .field('language', boardData.language)
          .attach('boardImg', imagePathArray[1]);

        const uploadRes = JSON.parse(uploadInstance.res.text);
        testBoardId = uploadRes.data._id;

        // console.log(testBoardId) // ok
      });
    });

    describe('추가', () => {
      test('성공 | 201', async () => {
        await request(app)
          .post(`/interaction/bookmark`)
          .send({ boardId: testBoardId })
          .set('x-access-token', userToken)
          .expect(201);

        const response = await request(app)
          .get(`/interaction/bookmark?screenId=${screenId}`)
          .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.length).toBe(1);
      });
    });

    describe('북마크 삭제', () => {
      test('성공 | 200', async () => {
        await request(app)
          .delete(`/interaction/bookmark`)
          .send({ boardId: testBoardId })
          .set('x-access-token', userToken)
          .expect(200);

        const response = await request(app)
          .get(`/interaction/bookmark?screenId=${screenId}`)
          .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.length).toBe(0);
      });
    });

    test('실패: 존재하지 않는 데이터에 접근 | 404', async () => {
      await request(app)
        .post(`/interaction/bookmark`)
        .send({ boardId: invalidId })
        .set('x-access-token', userToken)
        .expect(404);
    });

    test('실패: 부적절한 아이디에 접근 | 400', async () => {
      await request(app)
        .post(`/interaction/bookmark`)
        .send({ boardId: '123' })
        .set('x-access-token', userToken)
        .expect(400);
    });
  });

  describe('테스트 종료', () => {
    test('S3 오브젝트 삭제 | 200', async () => {
      await request(app)
        .delete(`/boards/${testBoardId}`)
        .set('x-access-token', userToken)
        .expect(200);
    });
  });
});
