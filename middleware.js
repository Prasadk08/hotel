const User = require("./models/user")

const expressError = require("./utils/expressError")
const {waiterSchema,hotelSchema} = require("./schema")

module.exports.isLoggedIn=(req,res,next)=>{

    if(!req.isAuthenticated()){
        req.flash("error","You should logged In")
        res.render("index.ejs")
    }else{
        next()
    }
}

module.exports.uniqueUsername=async(req,res,next)=>{
        let {username}=req.body
        let manager = await User.findOne({username})

        if(manager){
            console.log("i am testing")
            req.flash("error","Username not available")
            res.redirect("/signup")
            // next(new expressError(400,"Username not available"))
        }else{
            next()
        }

}
module.exports.uniqueUsername2=async(req,res,next)=>{
        let {username}=req.body.waiter
        let manager = await User.findOne({username})

        if(manager){
            console.log("i am testing")
            req.flash("error","Username not available")
            res.redirect("/hotel/addwaiter")
            // next(new expressError(400,"Username not available"))
        }else{
            next()
        }

}
module.exports.validatehotel=(req,res,next)=>{

    const {error}=hotelSchema.validate(req.body)
    if(error){
        const errmsg = error.details.map((el)=> el.message ).join(",")
        req.flash("error", errmsg);
        return res.redirect(`/signupform/${req.params.id}`);
    }else{
        next()
    }

}

module.exports.validatewaiter=(req,res,next)=>{

    const {error}=waiterSchema.validate(req.body)
    if(error){
        const errmsg = error.details.map((el)=> el.message ).join(",")
        throw new expressError(400,errmsg)
    }else{
        next()
    }

}



