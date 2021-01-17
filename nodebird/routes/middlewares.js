// 접근 권한 제어할 미들웨어
exports.isLoggedIn = (req, res, next) => { // 로그인
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send('로그인 필요');
    }
};

exports.isNotLoggedIn = (req, res, next) => { // 로그인 안함
    if (!req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent('로그인한 상태');
        res.redirect(`/?error=${message}`);
    }
};