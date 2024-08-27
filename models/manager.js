const mongoose= require('mongoose')
const Schema= mongoose.Schema
const passportlocalmongoose=require('passport-local-mongoose')

const managerSchema = new Schema({

    email:{
        type:String
    },
    hoteldetails:{
        type:mongoose.Schema.ObjectId,
        ref:"Hotel"
    },
    role: {
        type: String,
        enum: ['Manager'],
        default: 'Manager',
    }
})

managerSchema.plugin(passportlocalmongoose)
module.exports= mongoose.model("Manager",managerSchema)
