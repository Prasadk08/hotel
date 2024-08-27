const Manager = require("./models/manager")
const Waiter = require("./models/waiter")
const expressError = require("./utils/expressError")

module.exports.isLoggedIn=(req,res,next)=>{
    console.log("in the funtion")
    if(!req.isAuthenticated()){
        req.flash("error","You should logged In")
        console.log("in the funtion")
        res.render("index.ejs")
    }else{
        next()
    }
}

module.exports.uniqueUsername=async(req,res,next)=>{
        let {username}=req.body
        let manager = await Manager.findOne({username})
        console.log(manager)
        if(manager){
            console.log("i am testing")
            req.flash("error","Username not available")
            res.redirect("/signup")
            // next(new expressError(400,"Username not available"))
        }else{
            next()
        }

}
module.exports.hotelnameSession=async(req,res,next)=>{
    let {username}=req.body
    let data = await Manager.findByUsername(username).populate('hoteldetails');
    req.session.testhotelname = data.hoteldetails.hotelname;

    res.locals.testhotelname = req.session.testhotelname || 'Default Hotel Name'
    next();

}
module.exports.hotelnameSessionWaiter=async(req,res,next)=>{
    let {username}=req.body
    let data = await Waiter.findByUsername(username).populate('hotelid');
    req.session.testhotelname = data.hotelid.hotelname;
    
    res.locals.testhotelname = req.session.testhotelname || ''
    next();

}


