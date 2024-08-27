const express = require('express')
const router = express.Router({mergeParams:true})
const passport = require('passport')
const Manager = require('../models/manager')
const Hotel = require('../models/hotel')
const{uniqueUsername, hotelnameSession, hotelnameSessionWaiter} = require('../middleware')
const Waiter = require('../models/waiter')
const MenuCard = require('../models/menucard')
const Order = require('../models/order')



router.get("/managerlogin",(req,res)=>{
    res.render("user/managerlogin.ejs")
})


router.post("/managerlogin",
    passport.authenticate("manager-local", {
        failureRedirect: "/managerlogin",
        failureFlash: false
    }),
    hotelnameSession,
    async (req, res) => {
        // let { username } = req.body;
        // let newhoteldetail = await Manager.findOne({ username }).populate("hoteldetails");
        // newhoteldetail = newhoteldetail.hoteldetails;

        req.session.save((err) => {
            if (err) console.log('Session save error:', err);
        });


        res.render("hotel/home.ejs");
    }
);



router.get("/waiterlogin",(req,res)=>{
    res.render("user/waiterlogin.ejs")
})

router.post("/waiterlogin",
    passport.authenticate(
    "waiter-local",{
    failureRedirect:"/waiterlogin",
    failureFlash:false}),
    hotelnameSessionWaiter,
    async(req,res)=>{
        let {username}=req.body
        let newhoteldetail = await Waiter.findOne({username}).populate("hotelid")
        console.log(newhoteldetail)
        newhoteldetail =newhoteldetail.hotelid
        console.log(newhoteldetail)

        req.session.save((err) => {
            if (err) console.log('Session save error:', err);
        });

        res.render("hotel/home",{newhoteldetail})
})

router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs")
})


router.post("/signup",uniqueUsername,async(req,res)=>{
try{
    console.log("inside business logic")
    let{email,username,password}=req.body
    let newuser = new Manager({email,username})
    await Manager.register(newuser,password)
    req.login(newuser,(err)=>{
        if(err){
            console.log("user is not registered")
        }else{
            res.redirect(`/signupform/${newuser._id}`)
        }
    })
}
catch(err){
    console.log(err)
    console.log("user is not not registerd")
    res.render("user/signup")
}
})

router.get("/signupform/:id",(req,res)=>{
    let {id}=req.params
    res.render("user/signupform.ejs",{id})
})


router.post("/signupform/:id",async(req,res)=>{
    let {id}=req.params
    let newhotel = await Manager.findById(id)

    let newhoteldetail = new Hotel(req.body.manager)
    let newmenucard = new MenuCard({})
    let newwaiter = new Waiter({})


    newhotel.hoteldetails= newhoteldetail
    newhotel.hoteldetails.menucard=newmenucard
    newhotel.hoteldetails.waiters=newwaiter

    await newwaiter.save()
    await newmenucard.save()
    await newhoteldetail.save()
    await newhotel.save()

    res.render("hotel/home.ejs",{newhoteldetail})
})

router.get("/logout", async (req, res, next) => {
    req.logout((err)=>{
        if(err){
            return next(err)
        }else{
            // req.flash("success","You are successfully logout")
            res.redirect("/")
        }
    })
});

module.exports = router