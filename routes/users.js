const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const util = require('util');
const Users = require('../models/users');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const randomBytesPromise = util.promisify(crypto.randomBytes);
const pbkdf2Promise = util.promisify(crypto.pbkdf2);

const {verifyToken} = require('./authorization');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.status(201).json({
    result:'ok',
    comment:'users router is ok'
  });
});

router.get('/login', function(req, res, next) {
  res.status(401).json({
    result:'error',
    reason:'not allow method'
  })
})

router.post('/login', async function(req, res, next) {
  const email = req.body['email'];
  const userPw = req.body['userPw'];
  
  const user = await Users.getSalt(email);
  if(user){
    const crypt_Pw = await pbkdf2Promise(userPw, user['salt'], 93782, 64, 'sha512');

    const result = await Users.findUser(email, crypt_Pw.toString('base64'));
    if (result) {
      const token = jwt.sign({
        email: result['email'],
        nick: result['nickname'],
        uid: result['_id']
        }, SECRET_KEY, {
        expiresIn: '1h'
      });

      res.cookie('user', token, {httpOnly:true, secure:true});
      
      res.status(201).json({
        result: 'ok'
      });
    } else {
      res.status(401).json({
        result:"error",
        reason:"잘못된 비밀번호 입니다."
      })
    }
  }
  else {
    res.status(401).json({
      result:"error",
      reason:"유저를 찾을 수 없습니다."
    })
  }
})

router.get('/join', function(req, res, next) {
  res.status(401).json({
    result:'error',
    reason:'not allow method'
  })
})

router.post('/join', async function(req, res, next) {
  const email = req.body['email'];
  const userPw = req.body['userPw'];
  const userPwRe = req.body['userPwRe'];
  const nick = req.body['userNick'];
  const check = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(userPw);

  if (check) {
      if (userPw == userPwRe) {
          const salt = await randomBytesPromise(64);
          const crypt_Pw = await pbkdf2Promise(userPw, salt.toString('base64'), 93782, 64, 'sha512');
          const result = await Users.create({
            email:email, 
            password: crypt_Pw.toString('base64'), 
            salt: salt.toString('base64'),
            nickname: nick,
            isConfirmed: false
          });
          if(result) {
            res.status(201).json({
              result: 'ok',
              user:{
                email:result['email'],
                nick:result['nickname']
              }
            });
          }
          else {
            res.status(401).json({
              result:"error",
              reason:"이미 존재하는 아이디 입니다. 다시 시도해주세요!"
            })
          }
      } else {
        res.status(401).json({
          result:"error",
          reason:"패스워드가 일치하지 않습니다!"
        })
      }
  } else {
    res.status(401).json({
      result:"error",
      reason:"비밀번호 규칙을 다시 확인해주세요."
    })
  }
})

router.get('/editProfile', function(req, res, next) {
  res.status(401).json({
    result:'error',
    reason:'not allow method'
  })
})

router.post('/editProfile', verifyToken, async function(req, res, next) {
  const uid = res.locals.uid;
})

router.get('/changePass', function(req, res, next) {
  res.status(401).json({
    result:'error',
    reason:'not allow method'
  })
})

router.post('/changePass', verifyToken, async function(req, res, next) {
  //const email = req.body['email']; jwt 토큰에서 얻어야함
  const uid = res.locals.uid;
  const userPw = req.body['userPw'];
  const userPwNew = req.body['newUserPw'];
  const userPwNewRe = req.body['newUserPwRe'];
  if(userPw != userPwNew){
    if(userPwNew == userPwNewRe){
      const check = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(userPwNew);

      if(check) {
          const info = await Users.getUserInfo(uid);
          const saltNew = await randomBytesPromise(64);
          const crypt_Pw = await pbkdf2Promise(userPw, info['salt'], 93782, 64, 'sha512');
          const crypt_PwNew = await pbkdf2Promise(userPwNew, saltNew.toString('base64'), 93782, 64, 'sha512');
          const result = await Users.changePass(uid, crypt_Pw.toString('base64'), crypt_PwNew.toString('base64'), saltNew.toString('base64'));
          if(result){
              res.status(201).json({
                result:'ok'
              })
          } else {
            res.status(401).json({
              result:"error",
              reason:"기존 비밀번호가 일치하지 않거나 존재하지 않는 아이디입니다. 다시 확인하세요."
            })
          } 
      } else {
        res.status(401).json({
          result:"error",
          reason:"비밀번호 규칙을 다시 확인해주세요."
        })
      }
    }
    else {
      res.status(401).json({
        result:"error",
        reason:"재입력된 비밀번호가 일치하지 않습니다."
      })
    }
  }
  else {
    res.status(401).json({
      result:"error",
      reason:"기본 비밀번호와  동일한 비밀번호는 사용할 수 없습니다."
    })
  }
})

router.get('/deleteAccount', function(req, res, next) {
  res.status(401).json({
    result:'error',
    reason:'not allow method'
  })
})

router.post('/deleteAccount', verifyToken, async function(req, res, next) {
  //const email = req.body['email'];
  const uid = res.locals.uid;
  const userPw = req.body['userPw'];

  const info = await Users.getUserInfo(uid);

  const crypt_Pw = await pbkdf2Promise(userPw, info['salt'], 93782, 64, 'sha512');
  
  const result = await Users.deleteUser(uid, crypt_Pw.toString('base64'))
  if(result['deletedCount'] == 1){
    res.status(201).json({
      result:'ok'
    })
  } else {
    res.status(401).json({
      result:"error",
      reason:"비밀번호가 일치하지 않습니다. 다시 확인하세요."
    })
  } 
})

module.exports = router;
