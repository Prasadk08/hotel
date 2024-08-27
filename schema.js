const joi = require('joi')

module.exports.hotelSchema= joi.object({
    hotel:joi.object({
        hotelname:joi.string().required(),
        ownername:joi.string().required(),
        phno:joi.number().min(10).max(10).required(),
    }).required()

})
module.exports.managerSchema= joi.object({
    manager:joi.object({
        email:joi.string().required(),
    }).required()
})
