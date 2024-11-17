const express = require('express')
const router = express.Router({mergeParams:true})
const passport = require('passport')

const Hotel = require('../models/hotel')
const{uniqueUsername,validatehotel} = require('../middleware')

const MenuCard = require('../models/menucard')
const User = require("../models/user");



router.get("/login",(req,res)=>{
    res.render("user/login.ejs")
})


router.post("/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: false
    }),
    async (req, res) => {

        req.session.save((err) => {
            if (err) console.log('Session save error:', err);
        });

        let {username}=req.body
        let newhoteldetail = await User.findOne({username}).populate("hotelid")

        let allwaiterdata=[]
        for(let waiter of newhoteldetail.hotelid.waiters){
            allwaiterdata.push(await User.findById(waiter))
        }

        newhoteldetail =newhoteldetail.hotelid

        
        req.session.save((err) => {
            if (err) console.log('Session save error:', err);
        });
        req.flash("success","Welcome to Services")
        res.render("hotel/home.ejs",{newhoteldetail,allwaiterdata});
    }
);


router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs")
})


router.post("/signup",uniqueUsername,async(req,res)=>{
try{
    let{name,username,password}=req.body
    let newuser = new User({name,username,role: 'Manager'})
    await User.register(newuser,password)
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


router.post("/signupform/:id",validatehotel,async(req,res)=>{
    let {id}=req.params
    let newhotel = await User.findById(id)

    let newhoteldetail = new Hotel({
        ...req.body.manager,
        dailybills: [{ date: new Date(), todaysbill: [] }],
        sections: []
    });
    let newmenucard = new MenuCard({})

    newhotel.hotelid= newhoteldetail
    newhoteldetail.menucard = newmenucard

    if (req.body.manager.sections) {
        for (const section of req.body.manager.sections) {
            newhoteldetail.sections.push(section);
        }
    }

    let allwaiterdata=[]

    await newmenucard.save()
    await newhoteldetail.save()

    await newhotel.save();

    res.locals.testhotelname = req.body.manager.hotelname;
    req.flash("success","Welcome to Restaurant Management")

    res.render("hotel/home.ejs", { newhoteldetail ,allwaiterdata});
})

router.get("/logout", async (req, res, next) => {

    req.logout((err)=>{
        if(err){
            return next(err)
        }else{
            // req.flash("success","You are successfully logout")
            req.flash("success","You logged out Successfully")
            res.redirect("/")
        }
    })
});

module.exports = router