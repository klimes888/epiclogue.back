const express = require('express');

const router = express.Router();
const mDB = require('../models/mariaDB_conn')

router.get('/', (req, res) => {
    res.redirect('/')
})

router.get('/:userID', async (req, res) => {
    const userID =  req.params.userID;
    const uuid = await mDB.getUserUUID(userID);
    const userProfile = await mDB.getUserProfile(uuid);
    const userPost = await mDB.getUserPost(uuid);
    let userPostArray = [];

    for(let i = 0; i  < userPost.length; i++) {
        userPostArray.push(userPost[i]);
    }
    
    res.render('profile', {
        userProfile: userProfile[0],
        userPost: userPostArray
    })
})

module.exports = router;