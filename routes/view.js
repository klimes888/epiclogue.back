const express = require('express');
const router = express.Router();
const mDB = require('../models/mariaDB_conn')
const fs = require('fs');

router.get('/', (req, res) => {
    res.redirect('/board')
})

router.get('/:postID', async function (req, res, next) {
    const postID = req.params.postID;
    const result = await mDB.showPost(postID);
    const userProfile = await mDB.getUserProfile(result[0].uuid);
    const imgFile = JSON.parse(fs.readFileSync('public/uploads/imgMeta.json'));
    let images;

    for (let i=0; i < imgFile.length; i++) {
        if(imgFile[i] != null && imgFile[i].postID == postID) {
            // console.log(imgFile[i].images)
            images = imgFile[i].images;
        }
    }
    res.render('view', {
        result: result[0],
        userProfile: userProfile[0],
        images: images})
});

module.exports = router;