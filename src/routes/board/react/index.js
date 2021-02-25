import express from 'express';
import * as reactCtrl from './react.ctrl';
import { verifyToken } from '../../../lib/middleware/tokenAuth';

const react = express.Router({
  mergeParams: true,
});

react.get('/', verifyToken, reactCtrl.getReact);

export default react;
