const { Role } = require('../models');

module.exports = function (req, res, next){

    Role.findOne({}, (err, roles) => {

        if(roles && roles.admin){
            const userId = req.decoded.user._id;
            
            let result = roles.admin.filter(user => user.userId == userId)[0];
        
            if(!result) return res.json({
                success: false,
                message: `Unsuccessful! Requested resource is only accessible to Admin`
            });
    
            next();
        }
        else return res.json({
            success: false,
            message: `Unsuccessful! Requested resource is only accessible to Admin`
        });
        
    })

   
}

