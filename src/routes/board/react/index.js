import express from 'express'
import * as reactCtrl from './react.ctrl'
import { authToken } from '../../../lib/middleware/tokenAuth'

const react = express.Router({
  mergeParams: true,
})

react.get('/', authToken, reactCtrl.getReact)

export default react
