const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try { // 폴더 생성
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 생성합니다.');
    fs.mkdirSync('uploads');
}

// multer 설정 업로드 미들웨어
const upload = multer({
    storage: multer.diskStorage({ // 서버 디스크에 이미지 저장
        destination(req, file, cb) { // 저장 경로
            cb(null, 'uploads/');
        },
        filename(req, file, cb) { // 파일명 만들기
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 파일 최대 용량
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => { // 이미지 업로드
    console.log(req.file); // 파일 정보
    res.json({ url: `/img/${req.file.filename}` }); // 프론트로 어디에 저장되어 있는지 알림
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => { // 게시글 업로드
    try {
        const post = await Post.create({ // 게시글 저장
            content: req.body.content,
            img: req.body.url,
            UserId: req.user.id,
        });
        const hashtags = req.body.content.match(/#[^\s#]+/g); // 정규표현식으로 해시태그 추출
        if (hashtags) {
            const result = await Promise.all( // 2차원 배열 반환
                hashtags.map(tag => {
                    return Hashtag.findOrCreate({
                        where: { title: tag.slice(1).toLowerCase() }, // #떼서 저장
                    })
                }),
            );
            await post.addHashtags(reault.map(r => r[0])); // 내용만 추출
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;