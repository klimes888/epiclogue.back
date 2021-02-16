import express from 'express';
import * as suggestCtrl from './suggest.ctrl';
import { verifyToken } from '../../lib/middleware/tokenAuth';

const suggest = express.Router();

suggest.get('/', verifyToken, suggestCtrl.getSearchSuggest);

export default suggest;
