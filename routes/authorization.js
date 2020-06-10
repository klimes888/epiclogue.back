const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
require('dotenv').config();
const verifyToken = (req, res, next) => {
    try {
        const clientToken = req.cookies.user;
        const decoded = jwt.verify(clientToken, SECRET_KEY);
        if (decoded) {
            res.locals.uid = decoded.uid;
            next();
        } else {
            res.status(401).json({
              result:'error', 
              reason:'검증 실패'
            });
        }
    } catch (err) {
        res.status(401).json({
          result: 'error',
          reason:'token 유효기간 만료'
        });
    }
  };
exports.verifyToken = verifyToken;