import { Router } from 'express'
const auth = new Router({ mergeParams: true })
import * as authCtrl from './auth.ctrl'

auth.get('/mailAuth', authCtrl.mailAuth)
auth.post('/login', authCtrl.login)
auth.post('/join', authCtrl.join)

export default auth
