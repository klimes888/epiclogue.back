import jwt from 'jsonwebtoken'
import '../env/env'

const { SECRET_KEY, JWT_EXPIRES_IN } = process.env

export const generateToken = async (nick, uid, isConfirmed) =>
  jwt.sign(
    {
      nick,
      uid,
      isConfirmed,
    },
    SECRET_KEY,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  )

export const verifyToken = async token => jwt.verify(token, SECRET_KEY)
