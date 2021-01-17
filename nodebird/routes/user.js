const express = require('express');

const { isLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/:id/follow', isLoggedIn, async (req, res, next) => { // id : 다른 사용자
    try {
        const user = await User.findOne({ where: { id: req.user.id } }); // '나'를 찾기
        if (user) {
            await user.addFollowing(parseInt(req.params.id, 10)); // 팔로잉 추가 (여러개면 배열도 가능)
            res.send('success');
        } else {
            res.status(404).send('no user');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;