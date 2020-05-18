const express = require('express');
const router = express.Router();

const mDB = require('../models/mariaDB_conn');

const crypto = require('crypto');
const util = require('util');

const randomBytesPromise = util.promisify(crypto.randomBytes);
const pbkdf2Promise = util.promisify(crypto.pbkdf2);

router.get('/', function (req, res, next) {
    res.render('password-change');
});

router.post('/', async function (req, res, next) {
    const userId = req.body['userId'];
    const userPw = req.body['userPw'];
    const userPwNew = req.body['userPwNew'];
    if(userPw != userPwNew){  
        const check = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(userPwNew);

        if(check) {
            const salt = await mDB.getSalt(userId);
            const saltNew = await randomBytesPromise(64);
            const crypt_Pw = await pbkdf2Promise(userPw, salt, 93782, 64, 'sha512');
            const crypt_PwNew = await pbkdf2Promise(userPwNew, saltNew.toString('base64'), 93782, 64, 'sha512');
            let result = await mDB.changePass(userId, crypt_Pw.toString('base64'), crypt_PwNew.toString('base64'), saltNew.toString('base64'), saltNew);

            if(result != false){
                res.send('변경 성공!')
            } else {
                res.send('기존 비밀번호가 일치하지 않거나 존재하지 않는 아이디입니다. 다시 확인하세요.')
            } 
        } else {
            res.send('비밀번호 규칙을 다시 확인해주세요.')
        }
    }
    else {
        res.send('기본 비밀번호와  동일한 비밀번호는 사용할 수 없습니다.')
    }
});

module.exports = router;