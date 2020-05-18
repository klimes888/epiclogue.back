const express = require('express');
const router = express.Router();

const mDB = require('../models/mariaDB_conn');

const crypto = require('crypto');
const util = require('util');

const pbkdf2Promise = util.promisify(crypto.pbkdf2);

router.get('/', function (req, res, next) {
    res.render('delete-account');
});

router.post('/', async function (req, res, next) {
    const userId = req.body['userId'];
    const userPw = req.body['userPw'];

    const salt = await mDB.getSalt(userId);

    const crypt_Pw = await pbkdf2Promise(userPw, salt, 93782, 64, 'sha512');
    
    let result = await mDB.delAccount(userId, crypt_Pw.toString('base64'))
    if(result != false){
        res.send('탈퇴 성공!')
    } else {
        res.send('기존 비밀번호가 일치하지 않거나 존재하지 않는 아이디입니다. 다시 확인하세요.')
    } 
});

module.exports = router;