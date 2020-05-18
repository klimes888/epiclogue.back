const express = require('express');
const router = express.Router();
const mDB = require('../models/mariaDB_conn');
const crypto = require('crypto');
const util = require('util');

const randomBytesPromise = util.promisify(crypto.randomBytes);
const pbkdf2Promise = util.promisify(crypto.pbkdf2);

router.get('/', function (req, res, next) {
    res.render('join');
});

router.post('/', async function (req, res, next) {
    const userId = req.body['userId'];
    const userPw = req.body['userPw'];
    const userPwRe = req.body['userPwRe'];
    const check = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(userPw);

    if (check) {
        if (userPw == userPwRe) {
            salt = await randomBytesPromise(64);
            crypt_Pw = await pbkdf2Promise(userPw, salt.toString('base64'), 93782, 64, 'sha512');
            result = await mDB.joinUser(userId, crypt_Pw.toString('base64'), salt.toString('base64'));
            if(result) {
                res.send('회원가입 완료!')
            }
            else {
                res.send('이미 존재하는 아이디 입니다. 다시 시도해주세요!')
            }
        } else {
            res.send('패스워드가 일치하지 않습니다!');
        }
    } else {
        res.send('비밀번호 생성 규칙을 다시 확인해주세요!')
    }

});

module.exports = router;