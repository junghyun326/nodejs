const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id); // 세션에 user.id 저장 -> auth.js
    });

    passport.deserializeUser((id, done) => { // 세션의 쿠키를 가지고 정보 복구 -> 사용자 정보
        User.findOne({
            where: { id },
            include: [{
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followers', // follower와 following 구분해주기
            }, {
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followings',
            }],
        })
            .then(user => done(null, user)) // -> req.user 객체
            .catch(err => done(err));
    });

    // Strategy 등록
    local();
    kakao();
}