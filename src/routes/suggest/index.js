import express from 'express';
import * as suggestCtrl from './suggest.ctrl';
import { authToken } from '../../lib/middleware/tokenAuth';

const suggest = express.Router();

suggest.get('/', authToken, suggestCtrl.getSearchSuggest);

export default suggest;
