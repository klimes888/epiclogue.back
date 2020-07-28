var express = require('express');
var router = express.Router();
const {verifyToken} = require('./authorization');

router.get('/', verifyToken, async function(req, res, next) {

})

router.post('/', verifyToken, async function(req, res, next) {

})

router.delete('/', verifyToken, async function(req, res, next) {

})

module.exports = router;