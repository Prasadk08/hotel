const mongoose = require('mongoose')
const {Schema}=mongoose
const Waiter= require('./waiter')
const MenuCard = require('./menucard.js')


const hotelSchema = new Schema({
    hotelname:{
        type:String
    },
    ownername:{
        type:String
    },
    phno:{
        type:Number
    },
    waiters:[{
        type:mongoose.Schema.ObjectId,
        ref:"Waiter"
    }],
    menucard:[{
        type:mongoose.Schema.ObjectId,
        ref:"MenuCard"
    }]

})

const Hotel = mongoose.model("Hotel",hotelSchema)

module.exports=Hotel