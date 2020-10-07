import express from 'express'
const suggest = express.Router()
import * as suggestCtrl from './suggest.ctrl'
import { verifyToken } from '../../lib/middleware/tokenAuth'

suggest.get('/', verifyToken, suggestCtrl.getSearchSuggest)

export default suggest
