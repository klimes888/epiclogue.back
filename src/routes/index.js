import express from 'express'

const router = express.Router({
  mergeParams: true,
})

router.get('/', (req, res, next) => {
  res.status(200).json({
    result: 'ok',
    comment: 'server is ok with codeDeploy?',
  })
})

module.exports = router
