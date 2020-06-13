var express = require('express');
var router = express.Router();
const {verifyToken} = require('./authorization');

router.post('/liking', verifyToken, async function(req, res, next) {

})

router.post('/unliking', verifyToken, async function(req, res, next) {

})

module.exports = router;