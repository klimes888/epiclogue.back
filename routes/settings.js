const express = require('express')
const router = express.Router();
const mDB = require('../models/mariaDB_conn')

router.get('/', async (req, res) => {
    if (req.session.uuid == undefined) {
        res.redirect('/');
    }

    const uuid = req.session.uuid;
    const userProfile = await mDB.getUserProfile(uuid);

    res.render('settings', {
        userProfile: userProfile[0]
    })
})

router.post('/', async (req, res) => {
    if (req.session.uuid == undefined) {
        res.redirect('/');
    }
    const uuid = req.session.uuid;
    let id = req.session.id;

    let result = await mDB.updateProfile(uuid);

    res.redirect('/profile/')
})

module.exports = router;