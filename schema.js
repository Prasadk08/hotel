const joi = require('joi')


module.exports.hotelSchema= joi.object({
    manager:joi.object({
        hotelname:joi.string().required(),
        ownername:joi.string().required(),
        phno: joi.string().length(10).pattern(/^[0-9]+$/).required(),
        totalsection:joi.number().required(),
        sections: joi.array().items(
            joi.object({
                name: joi.string().required(),
                capacity: joi.number().required()
            })
        ).required()
    }).required()

})

module.exports.managerSchema= joi.object({
    manager:joi.object({
        email:joi.string().required(),
    }).required()
})

module.exports.waiterSchema= joi.object({
    waiter:joi.object({
        name:joi.string().required(),
        phno:joi.number().min(10).required(),
        username: joi.string().required(),
        password: joi.string().required()
    }).required(),

})

