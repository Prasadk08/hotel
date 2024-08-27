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


// sir aap jab bhi pehli bar login karoge to req.user me object store hote hai lekin aap jab bhi session logout karke waiter login se login karoge to login to hota hai lekin woh req.user me object dta store nahi kar raha hai