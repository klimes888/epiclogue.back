import { boardDAO } from '../../DAO'
import { apiErrorGenerator } from '../apiErrorGenerator'
import { deleteImage } from '../imageCtrl'

const checkSecondaryAllow = async (req, res, next) => {
  const { originBoardId } = req.body

  const isAllowing = await boardDAO.getSecondaryAllow(originBoardId)
  if (isAllowing.allowSecondaryCreation === 1) {
    next()
  } else {
    deleteImage(req.files.location)
    return next(apiErrorGenerator(400, '2차창작을 허용하지 않는 게시물입니다.'))
  }
}

export default checkSecondaryAllow
