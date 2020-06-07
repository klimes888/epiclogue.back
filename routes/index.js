var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(201).json({
    result:'ok',
    comment:'server is ok'
  });
});

module.exports = router;
