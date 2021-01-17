const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { email, nick, password } = req.body;
    try {
        const exUser = await User.findOne({ where: { email } }); // 기존 회원이 있는지 확인
        if (exUser) {
            return res.redirect('/join?error=exist'); // 쿼리스트링으로 프론트에게 알려줌
        }
        const hash = await bcrypt.hash(password, 12); // 비밀번호 해시화
        await User.create({
            email,
            nick,
            password: hash,
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => { // -> localStrategy.js
        if (authError) { // 서버 에러
            console.error(authError);
            return next(authError);
        }
        if (!user) { // 로그인 실패
            return res.redirect(`/?loginError=${info.message}`); // 프론트에게 전달
        }
        return req.login(user, (loginError) => { // -> index.js
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            // 세션 쿠키를 브라우저로 보냄
            return res.redirect('/'); // 성공 -> 메인페이지
        });
    })(req, res, next); // 미들웨어 내의 미들웨어에 붙여줘야함
});

router.get('/logout', isLoggedIn, (req, res) => { // 로그인 -> 세션에 세션쿠키 있는 것
    req.logout();
    req.session.destroy(); // 세션쿠키 삭제
    res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao')); // -> kakaoStrategy

router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/', // 실패
}), (req, res) => {
    res.redirect('/'); // 인증 성공
});

module.exports = router;