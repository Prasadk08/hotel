const mongoose= require('mongoose')
const Schema= mongoose.Schema
const passportlocalmongoose=require('passport-local-mongoose')

const userSchema = new Schema({

    name:{
        type:String
    },
    email:{
        type:String
    },
    hotelid:{
        type:mongoose.Schema.ObjectId,
        ref:"Hotel"
    },
    role: {
        type: String
    },
    myservings: [{
        cancelleditems:{
            type:[String]
        },
        tableno: {
            type: Number
        },
        section:String,
        serving: [{}]
    }]
})

userSchema.plugin(passportlocalmongoose)
module.exports= mongoose.model("User",userSchema)
