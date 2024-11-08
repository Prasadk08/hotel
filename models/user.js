const mongoose= require('mongoose')
const Schema= mongoose.Schema
const passportlocalmongoose=require('passport-local-mongoose')

const userSchema = new Schema({

    email:{
        type:String
    },
    hotelid:{
        type:mongoose.Schema.ObjectId,
        ref:"Hotel"
    },
    role: {
        type: String
    }
})

userSchema.plugin(passportlocalmongoose)
module.exports= mongoose.model("user",userSchema)
