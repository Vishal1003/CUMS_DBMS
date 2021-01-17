const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
            if (err) {
                console.log(err);
                res.redirect('/admin/login');
            } else {
                req.user = result.id;
                next();
            }
        })
    } else {
        res.redirect('/admin/login')
    }
}

const forwardAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
            if (err) {
                console.log(err);
                next();
            } else {
                req.user = result.id;
                res.redirect('/admin/dashboard');
            }
        });
    } else {
        next();
    }
}

module.exports = {requireAuth, forwardAuth};