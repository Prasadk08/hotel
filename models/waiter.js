const mongoose = require('mongoose')
const {Schema}= require('mongoose')
const passportlocalmongoose = require('passport-local-mongoose')


const waiterSchema = new Schema({

    name:{
        type:String
    },
    phNo:{
        type:Number
    },
    hoteid:{
        type:mongoose.Schema.ObjectId,
        ref:"Hotel"
    }
})

waiterSchema.plugin(passportlocalmongoose)
const Waiter = mongoose.model("Waiter",waiterSchema)

module.exports=Waiter