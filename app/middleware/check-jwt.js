const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function (req, res, next){
    let token = req.headers["authorization"];
    // console.log('Authorization: ', req.headers["authorization"]);

    if(!token) 
        return res.status(403).json({
            success: false,
            message: 'No token provided'
        });

    jwt.verify(token, config.sessionSecret, (err, decoded) => {
        if(err) 
            return res.json({
                success: false,
                message: `Failed to authenticate token: ${err}`
            });

        req.decoded = decoded;
        next();
    });
}