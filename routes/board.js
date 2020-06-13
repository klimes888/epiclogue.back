var express = require('express');
var router = express.Router();
const {verifyToken} = require('./authorization');

router.post('/posting', verifyToken, async function(req, res, next) {

})

router.post('/editBoard', verifyToken, async function(req, res, next) {

})

router.post('/translate', verifyToken, async function(req, res, next) {

})

router.post('/comment', verifyToken, async function(req, res, next) {
  
})

router.get('/postlist', verifyToken, async function(req,res,next) {
    
})

module.exports = router;