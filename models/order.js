
const mongoose = require('mongoose')
const {Schema}=mongoose

const orderSchema = new Schema({
    tableno:Number,
    orders:[{
        foodname:String,
        foodprice:Number,
        quantity:Number
    }],
    waiterid:{
        type:mongoose.Schema.ObjectId,
        ref:"Waiter"
    }
})

module.exports = mongoose.model("Order",orderSchema)