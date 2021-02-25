import { Router } from 'express';
import bookmark from './bookmark';
import like from './like';
import follow from './follow';

const interaction = new Router();

interaction.use('/bookmark', bookmark);
interaction.use('/like', like);
interaction.use('/follow', follow);

export default interaction;
