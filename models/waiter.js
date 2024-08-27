const mongoose = require('mongoose')
const {Schema}= require('mongoose')
const passportlocalmongoose = require('passport-local-mongoose')


const waiterSchema = new Schema({

    name:{
        type:String
    },
    phno:{
        type:Number
    },

    role: {
        type: String,
        enum: ['Waiter'],
        default: 'Waiter',
    },
    hotelid:{
        type:mongoose.Schema.ObjectId,
        ref:"Hotel"
    }
})

waiterSchema.plugin(passportlocalmongoose)
const Waiter = mongoose.model("Waiter",waiterSchema)

module.exports=Waiter