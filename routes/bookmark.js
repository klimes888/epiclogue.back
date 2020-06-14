var express = require('express');
var router = express.Router();
const {verifyToken} = require('./authorization');

router.post('/marking', verifyToken, async function(req, res, next) {

})

router.post('/unmarking', verifyToken, async function(req, res, next) {

})

module.exports = router;