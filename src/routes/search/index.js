import express from 'express';
const search = express.Router();
import * as searchCtrl from './search.ctrl'

search.get('/', searchCtrl.searchPreview);
search.get('/result', searchCtrl.searchResult);

export default search;