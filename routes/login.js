const express = require('express');
const router = express.Router();
const mDB = require('../models/mariaDB_conn');
const crypto = require('crypto');
const util = require('util');

const pbkdf2Promise = util.promisify(crypto.pbkdf2);

router.get('/', (req, res) => {      // 1
    console.log(req.session)
    if(req.session.logined) {
        res.render('logout', { id: req.session.user_id });
    } else {
        res.render('login');
    }
});

router.post('/', async function (req, res, next) {
    const userId = req.body['userId'];
    const userPw = req.body['userPw'];
    
    const salt = await mDB.getSalt(userId);
    if (salt == false) {
        res.send('유저가 존재하지 않습니다.');
        res.end();
    }
    const crypt_Pw = await pbkdf2Promise(userPw, salt, 93782, 64, 'sha512');

    let result = await mDB.isLogin(userId, crypt_Pw.toString('base64'));

    if (result[0]!=undefined) {
        req.session.uuid = result[0].uuid;
        req.session.nickname = result[0].nickname;
        req.session.user_id = userId;
        req.session.logined = true;
        req.session.save(function(){
            res.redirect('/');
        })

    } else {
        res.send('no data');
    }
});


module.exports = router;