const express = require('express');
const mDB = require('../models/mariaDB_conn');
const formidable = require('formidable')
const fs = require('fs');
const router = express.Router();

router.get('/', async function (req, res, next) {
    const result = await mDB.showBoard();

    res.render('board', {
        result: result
    });
});

// 파일 업로드 옵션
const options = {
    uploadDir: 'public/uploads/',
    keepExtensions: true,
    multiples: true,
    maxFileSize: 50 * 1024 * 1024  // 50MB
}

// 생성
router.get('/compose', function (req, res, next) {
    console.log(`Posting requested
    UUID ${req.session.uuid}
    userID ${req.session.user_id}`)
    if (req.session.user_id == undefined) {
        res.send('글쓰기는 로그인 후 사용할 수 있습니다.')
    } else {
        res.render('compose')
    }
});

router.post('/compose', async function (req, res, next) {
    if (req.session.user_id == undefined) {
        res.send('글쓰기는 로그인 후 사용할 수 있습니다.')
    }
    console.log(req.body.file);
    const form = formidable(options);
    form.parse(req, async (err, fields, files) => {
        if (err) {
            throw err;
        }
        const result = await mDB.posting(fields.title, fields.content, req.session.uuid);
        const postID = result[0]['MAX(post_id)'];

        // 메타파일 읽기
        const lagacyMetaFile = fs.readFileSync('public/uploads/imgMeta.json');
        let metaResult = JSON.parse(lagacyMetaFile);

        // 메타파일 생성을 위한 JSON 포맷
        let metaFile = {
            "postID": postID,
            "images": []
        };
        // 파일 없음
        if (files.imgFile.size == 0) {
            metaFile.images = [];
        }
        else { // 파일 있음
            if (files.imgFile.length >= 2) { // 복수개
                for (let i = 0; i < files.imgFile.length; i++) {
                    await metaFile.images.push((files.imgFile[i].path).substring(7, files.imgFile[i].path.length))
                }
            }
            else { // 한 개
                metaFile.images = (files.imgFile.path).substring(7, files.imgFile.path.length);
            }
        }

        // 전체값에 추가
        await metaResult.push(metaFile);
        // 파일에 쓰기
        await fs.writeFileSync('public/uploads/imgMeta.json', JSON.stringify(metaResult))

        if (result != undefined) {
            res.redirect('/board')
        }
        else {
            console.log(`결과: ${result}`)
            res.send('글 쓰기 실패')
        }
    });
})

// 업데이트
router.get('/update/:postID', async function (req, res, next) {
    const postID = req.params.postID;
    const postUUID = await mDB.getPostUUID(postID);
    if (postUUID == req.session.uuid) {
        const result = await mDB.showPost(postID);
        res.render('update', result[0]);
    }
    else {
        res.send('작성자만 수정할 수 있습니다.')
    }
});

router.post('/update/:postID', async function (req, res, next) {
    const postID = req.params.postID;
    const title = req.body['title'];
    const content = req.body['content'];
    await mDB.updatePost(postID, title, content);
    const form = formidable(options);

    // console.log(req.body['imgFile']); // 없으면 공백, 1개는 파일 이름, 복수는 이름 배열

    if (req.body.imgFile != '') {
        form.parse(req, async (err, fields, files) => {
            if (err) {
                throw err;
            }
            console.log('form.parse files: ' + files);
            console.log('form.parse files: ' + req);

            const lagacyMetaFile = await fs.readFileSync('public/uploads/imgMeta.json');
            let metaResult = JSON.parse(lagacyMetaFile);
            console.log(files);
            for (let i = 0; i < metaResult.length; i++) {
                if (postID == metaResult[i].postID) {
                    // 기존 파일 삭제
                    if (Array.isArray(metaResult[i].images)) {   // 복수개
                        for (let j = 0; j < metaResult[i].images.length; j++) {
                            await fs.unlinkSync(`public/${metaResult[i].images[j]}`)
                        }
                    }
                    else { // 1개
                        await fs.unlinkSync(`public/${metaResult[i].images}`)
                    }
                    // 요청 파일 메타 추가
                }
            }
        })
    }
    res.redirect('/board');
});

// 삭제
router.get('/delete/:postID', async function (req, res, next) {
    const postID = req.params.postID;
    const postUUID = await mDB.getPostUUID(postID);
    if (postUUID == req.session.uuid) {
        await mDB.delPost(postID)
        const lagacyMetaFile = await fs.readFileSync('public/uploads/imgMeta.json');
        let metaResult = JSON.parse(lagacyMetaFile);
        // 이미지 삭제부
        for (let i = 0; i < metaResult.length; i++) {
            if (metaResult[i].postID == postID) {
                // 디렉토리 이미지 삭제
                if (Array.isArray(metaResult[i].images)) {   // 복수개
                    for (let j = 0; j < metaResult[i].images.length; j++) {
                        await fs.unlinkSync(`public/${metaResult[i].images[j]}`)
                    }
                }
                else { // 1개
                    await fs.unlinkSync(`public/${metaResult[i].images}`)
                }
                await delete metaResult[i];
                await metaResult.splice(i, 1);
                break;
            }
        }
        await fs.writeFileSync('public/uploads/imgMeta.json', JSON.stringify(metaResult))
        res.redirect('/board')
    }
    else {
        res.send('작성자만 삭제할 수 있습니다.')
    }
});

module.exports = router;