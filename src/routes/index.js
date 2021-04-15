import express from 'express'
import redisClient from '../lib/redisClient'

import usersRouter from './user'
import boardRouter from './board'
import searchRouter from './search'
import suggestRouter from './suggest'
import interactionRouter from './interaction'
import authRouter from './auth'
import notiRouter from './notification'
import myboardRouter from './myboard'

import { apiResponser } from '../lib/apiResponser'

const router = express.Router({
  mergeParams: true,
})

router.get('/', async (req, res, next) => {
  const data = {
    comment: 'server is ok',
    message: req.session.id,
    views: req.session.views,
  }

  apiResponser({ res, data })
})
router.get('/views', async (req, res, next) => {
  const views = await redisClient.getAsync(req.session.id)
  apiResponser({ res, statusCode: 200, data: views })
})
router.use('/auth', authRouter)
router.use('/user', usersRouter)
router.use('/boards', boardRouter)
router.use('/interaction', interactionRouter)
router.use('/search', searchRouter)
router.use('/suggest', suggestRouter)
router.use('/notification', notiRouter)
router.use('/myboard', myboardRouter)

module.exports = router
