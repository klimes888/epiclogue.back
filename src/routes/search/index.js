import express from 'express'
import * as searchCtrl from './search.ctrl'
import { authToken } from '../../lib/middleware/tokenAuth'

const search = express.Router()

search.get('/', authToken, searchCtrl.search)

export default search
