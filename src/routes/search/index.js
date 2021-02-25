import express from 'express';
import * as searchCtrl from './search.ctrl';
import { verifyToken } from '../../lib/middleware/tokenAuth';

const search = express.Router();

search.get('/', verifyToken, searchCtrl.search);

export default search;
