import { Router } from 'express'
const interaction = new Router()
import bookmark from './bookmark'
import like from './like'
import follow from './follow'

interaction.use('/bookmark', bookmark)
interaction.use('/like', like)
interaction.use('/follow', follow)

export default interaction
