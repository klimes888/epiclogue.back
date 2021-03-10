import aws from 'aws-sdk'
import multer from 'multer'
import multerS3 from 'multer-s3'
import dayjs from 'dayjs'
import crypto from 'crypto'
import util from 'util'
import dotenv from 'dotenv'

const randomBytesPromise = util.promisify(crypto.randomBytes)
dotenv.config()

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_ID, // 생성한 s3의 accesskey
  secretAccessKey: process.env.AWS_SECRET_KEY, // 생성한 s3의 secret key
  region: process.env.AWS_REGION, // 지역설정
})

const s3DeleteError = (err, data) => {
  if (err) {
    console.error(err, err.stack)
    console.error('s3DeleteObjectOutput', data)
  }
  return false
}

export const deleteImage = (images, location) => {
  let garbageImage = []
  let garbageThumb = []
  if (images === undefined) return false
  if (images instanceof Array) {
    garbageImage = images.map(image => {
      const objectKey = image.split('/')
      return {
        Key: objectKey[3],
      }
    })
    garbageThumb = images.map(image => {
      const objectKey = image.split('/')
      return {
        Key: `resized-${objectKey[3]}`,
      }
    })
  } else if (images instanceof Object) {
    if (images.origin === null) return false
    let objectKey = images.origin.split('/')
    garbageImage.push({
      Key: objectKey[3],
    })
    objectKey = images.thumbnail.split('/')
    garbageThumb.push({
      Key: `resized-${objectKey[3]}`,
    })
  } else {
    const objectKey = images.split('/')
    garbageImage.push({
      Key: objectKey[3],
    })
    garbageThumb.push({
      Key: `resized-${objectKey[3]}`,
    })
  }
  s3.deleteObjects(
    {
      Bucket:
        location === 'board'
          ? process.env.AWS_DATA_BUCKET_NAME
          : process.env.AWS_USERDATA_BUCKET_NAME,
      Delete: {
        Objects: garbageImage,
      },
    },
    s3DeleteError
  )
  s3.deleteObjects(
    {
      Bucket:
        location === 'board'
          ? `resized-${process.env.AWS_DATA_BUCKET_NAME}`
          : `resized-${process.env.AWS_USERDATA_BUCKET_NAME}`,
      Delete: {
        Objects: garbageThumb,
      },
    },
    s3DeleteError
  )
  return true
}

const contentDataStorage = multerS3({
  s3,
  bucket: process.env.AWS_DATA_BUCKET_NAME, // s3 생성시 버킷명
  acl: 'public-read', // 업로드 된 데이터를 URL로 읽을 때 설정하는 값입니다. 업로드만 한다면 필요없습니다.
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata(req, file, cb) {
    cb(null, { fieldName: file.fieldname }) // 파일 메타정보를 저장합니다.
  },
  async key(req, file, cb) {
    // 프로필, 배너, 투고 각각 다른 폴더에 저장하도록 key 추가 필요
    let name = await crypto
      .createHash('sha256')
      .update(file.originalname)
      .digest('hex')
      .slice(0, 16)
    const random = await randomBytesPromise(64)
    name += random.toString('hex').slice(0, 32)
    const type = file.mimetype.split('/')
    name += `.${type[1]}`
    cb(null, `${dayjs().format('YYYYMMDDHHmmss')}_${name}`)
  },
})

const userDataStorage = multerS3({
  s3,
  bucket: process.env.AWS_USERDATA_BUCKET_NAME, // s3 생성시 버킷명
  acl: 'public-read', // 업로드 된 데이터를 URL로 읽을 때 설정하는 값입니다. 업로드만 한다면 필요없습니다.
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata(req, file, cb) {
    cb(null, { fieldName: file.fieldname }) // 파일 메타정보를 저장합니다.
  },
  async key(req, file, cb) {
    // 프로필, 배너, 투고 각각 다른 폴더에 저장하도록 key 추가 필요
    let name = await crypto
      .createHash('sha256')
      .update(file.originalname)
      .digest('hex')
      .slice(0, 16)
    const random = await randomBytesPromise(64)
    name += random.toString('hex').slice(0, 32)
    const type = file.mimetype.split('/')
    name += `.${type[1]}`
    cb(null, `${dayjs().format('YYYYMMDDHHmmss')}_${name}`)
  },
})

export const thumbPathGen = originPath =>
  `${originPath[0]}//resized-${originPath[2]}/resized-${originPath[3]}`
export const uploadImage = multer({ storage: contentDataStorage })
export const uploadUserImage = multer({ storage: userDataStorage })
