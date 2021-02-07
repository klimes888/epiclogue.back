import express from 'express';

import usersRouter from './user';
import boardRouter from './board';
import searchRouter from './search';
import suggestRouter from './suggest';
import interactionRouter from './interaction';
import authRouter from './auth';
import notiRouter from './notification';
import myboardRouter from './myboard';

const router = express.Router({
  mergeParams: true,
});

router.get('/', (req, res) => {
  res.status(200).json({
    result: 'ok',
    comment: 'server is ok',
  });
});
router.use('/auth', authRouter);
router.use('/user', usersRouter);
router.use('/boards', boardRouter);
router.use('/interaction', interactionRouter);
router.use('/search', searchRouter);
router.use('/suggest', suggestRouter);
router.use('/notification', notiRouter);
router.use('/myboard', myboardRouter);

module.exports = router;
