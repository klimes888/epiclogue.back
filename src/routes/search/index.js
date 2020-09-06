import express from 'express';
const search = express.Router();
import * as searchCtrl from './search.ctrl'
import {verifyToken} from '../../lib/middleware/tokenAuth'

search.get('/', verifyToken, searchCtrl.searchPreview);
search.get('/result', verifyToken, searchCtrl.searchResult);

export default search;