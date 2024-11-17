const mongoose = require('mongoose')
const {Schema}=mongoose

const MenuCard = require('./menucard.js')
const { date } = require('joi')

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
        ref:"User",
    }],
    menucard:{
        type:mongoose.Schema.ObjectId,
        ref:"MenuCard"
    },
    orders:[{
        tableno:Number,
        waiterid:{
            type:mongoose.Schema.ObjectId,
            ref:"Waiter",
        },
        orderedfood:[{}]
    }],
    dailybills:[
        {
            date: { type: Date},
            todaysbill:[Number]
        }
    ],
    sections: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        capacity: {
            type: Number,
            required: true,
            min: 1
        }
    }]

})

module.exports = mongoose.model("Hotel",hotelSchema)

