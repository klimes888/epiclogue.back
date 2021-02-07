/* eslint-disable no-underscore-dangle */
import createError from 'http-errors';
import { Board } from '../../models';
import { deleteImage } from '../imageCtrl';

const checkSecondaryAllow = async (req, res, next) => {
  const { originBoardId } = req.body;

  const isAllowing = await Board.findOne({ _id: originBoardId }, { allowSecondaryCreation: 1 });
  if (isAllowing.allowSecondaryCreation === 1) {
    next();
  } else {
    deleteImage(req.files.location);
    console.log(
      `[INFO] 2차창작을 허용하지 않는 게시물 ${isAllowing._id} 에 대해 유저 ${res.locals.uid} 가 2차창작을 시도했습니다.`
    );
    return next(createError(400, '2차창작을 허용하지 않는 게시물입니다.'));
  }
};

export default checkSecondaryAllow;
