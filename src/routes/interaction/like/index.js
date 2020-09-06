import express from 'express';
const like = express.Router();
import * as likeCtrl from './like.ctrl'

like.get('/', likeCtrl.getLikeList);
like.post('/', likeCtrl.addLike);
like.delete('/', likeCtrl.deleteLike);

export default like;