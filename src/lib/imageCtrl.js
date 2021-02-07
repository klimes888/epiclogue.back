import aws from 'aws-sdk'
import multer from 'multer'
import multerS3 from 'multer-s3'
// import moment from 'moment'
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

// 이미지 삭제 함수 여기다 추가해서 export 필요

export const deleteImage = (images, location) => {
  const garbageImage = []
  if(images === undefined) return false
  if(images instanceof Array) {
    for (let image of images) {
      if (image) {
        const objectKey = image.split('/')
        const deletionFormat = {
          Key: objectKey[3],
        }
        garbageImage.push(deletionFormat)
      }
    }
  } else {
    const objectKey = images.split('/')
    const deletionFormat = {
      Key: objectKey[3],
    }
    garbageImage.push(deletionFormat)
  }
    s3.deleteObjects(
      {
        Bucket: location === 'board' ? process.env.AWS_DATA_BUCKET_NAME : process.env.AWS_USERDATA_BUCKET_NAME,
        Delete: {
          Objects: garbageImage,
        },
      },
      (err, data) => {
        if (err) {
          console.error(err, err.stack)
          return false
        }
      }
    )
  return true
}

const contentDataStorage = multerS3({
  s3: s3,
  bucket: process.env.AWS_DATA_BUCKET_NAME, // s3 생성시 버킷명
  acl: 'public-read', // 업로드 된 데이터를 URL로 읽을 때 설정하는 값입니다. 업로드만 한다면 필요없습니다.
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname }) // 파일 메타정보를 저장합니다.
  },
  key: async function (req, file, cb) {
    // 프로필, 배너, 투고 각각 다른 폴더에 저장하도록 key 추가 필요
    let name = await crypto
      .createHash('sha256')
      .update(file.originalname)
      .digest('hex')
      .slice(0, 16)
    const random = await randomBytesPromise(64)
    name += random.toString('hex').slice(0, 32)
    cb(null, dayjs().format('YYYYMMDDHHmmss') + '_' + name)
  },
})

const userDataStorage = multerS3({
  s3: s3,
  bucket: process.env.AWS_USERDATA_BUCKET_NAME, // s3 생성시 버킷명
  acl: 'public-read', // 업로드 된 데이터를 URL로 읽을 때 설정하는 값입니다. 업로드만 한다면 필요없습니다.
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname }) // 파일 메타정보를 저장합니다.
  },
  key: async function (req, file, cb) {
    // 프로필, 배너, 투고 각각 다른 폴더에 저장하도록 key 추가 필요
    let name = await crypto
      .createHash('sha256')
      .update(file.originalname)
      .digest('hex')
      .slice(0, 16)
    const random = await randomBytesPromise(64)
    name += random.toString('hex').slice(0, 32)
    cb(null, dayjs().format('YYYYMMDDHHmmss') + '_' + name)
  },
})

export const uploadImage = multer({ storage: contentDataStorage })
export const uploadUserImage = multer({storage: userDataStorage})