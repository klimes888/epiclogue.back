var express = require('express');
var router = express.Router();
const {verifyToken} = require('./authorization');
const like = require('../models/like')

router.get('/', verifyToken, async function(req, res, next) {
    const result = await like.getLikeList(res.locals.uid) // 타입추가 필요
    if(result) {
        res.status(201).json({
            result: 'ok',
        })
    } else {
        res.status(401).json({
            result: 'error',
        })
    }
})

router.post('/', verifyToken, async function(req, res, next) {
    const likeId = req.body.likeId
    const result = await like.unlike(likeId)
    if(result) {
        res.status(201).json({
            result: 'ok',
        })
    } else {
        res.status(401).json({
            result: 'error',
        })
    }
})

router.delete('/', verifyToken, async function(req, res, next) {
    const {targetType, targetId} = req.body
    const result = await like.create({
        userId:res.locals.uid,
        targetId,
        targetType
    })
    if(result._id) {
        res.status(201).json({
            result: 'ok',
        })
    } else {
        res.status(401).json({
            result: 'error',
        })
    }
})

module.exports = router;