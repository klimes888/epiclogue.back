import { Router } from 'express'
const interaction = new Router({ mergeParams: true })
import bookmark from './bookmark'
import like from './like'
import follow from './follow'

interaction.use('/:screenId/bookmark', bookmark)
interaction.use('/:screenId/like', like)
interaction.use('/:screenId/follow', follow)

export default interaction
