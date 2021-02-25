import dotenv from 'dotenv';
import randomString from 'random-string';
import request from 'supertest';
import { describe, test } from '@jest/globals';

import { User } from '../../../src/models';
import app from '../../../app';

dotenv.config();

let newUserId;
let verifiedToken;
const invalidId = '123456789012345678901234';

describe('팔로우 테스트', () => {
  const tempPw = `${randomString()}1!2@3#4$`;

  const userData = {
    email: `${randomString()}@lunarcat.com`,
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: randomString(),
    userLang: 0,
  };

  const verifiedUserData = {
    email: 'follow@lunarcat.com',
    userPw: tempPw,
    userPwRe: tempPw,
    userNick: randomString(),
    userLang: 0,
  };

  // eslint-disable-next-line no-undef
  beforeAll(async () => {
    // 임시유저 생성
    await request(app).post('/auth/join').send(userData);
    const newUserData = await User.findOne({ email: userData.email });
    newUserId = newUserData._id;

    // 이메일 인증된 사용자
    await request(app).post('/auth/join').send(verifiedUserData);
    await User.confirmUser(verifiedUserData.email);
    const verifiedLoginReponse = await request(app).post('/auth/login').send({
      email: verifiedUserData.email,
      userPw: verifiedUserData.userPw,
    });

    verifiedToken = verifiedLoginReponse.body.token;
  });

  describe('팔로우 테스트', () => {
    test('팔로우 성공 | 201', async () => {
      await request(app)
        .post(`/interaction/follow`)
        .send({ targetUserId: newUserId })
        .set('x-access-token', verifiedToken)
        .expect(201);
    });

    test('언팔로우 성공 | 200', async () => {
      await request(app)
        .delete(`/interaction/follow`)
        .send({ targetUserId: newUserId })
        .set('x-access-token', verifiedToken)
        .expect(200);
    });

    test('팔로우 실패: 없는 아이디에 접근 | 404', async () => {
      await request(app)
        .post(`/interaction/follow`)
        .send({ targetUserId: invalidId })
        .set('x-access-token', verifiedToken)
        .expect(404);
    });

    test('팔로우 실패: 부적절한 아이디에 접근 | 400', async () => {
      await request(app)
        .post(`/interaction/follow`)
        .send({ targetUserId: '123' })
        .set('x-access-token', verifiedToken)
        .expect(400);
    });
  });
});
