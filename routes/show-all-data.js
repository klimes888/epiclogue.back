const express = require('express');
const mDB = require('../models/mariaDB_conn');
const router = express.Router();

router.get('/', async function (req, res, next) {
    result = await mDB.getUserList();
    console.log(result);
    console.log(req.session)
    res.send(result)
});

module.exports = router;