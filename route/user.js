const express = require('express')
const router = express.Router({mergeParams:true})
const passport = require('passport')
const Manager = require('../models/manager')
const Hotel = require('../models/hotel')




router.get("/managerlogin",(req,res)=>{
    res.render("user/managerlogin.ejs")
})

router.post("/login",
    passport.authenticate(
    "local",{
    failureRedirect:"/managerlogin",
    failureFlash:false}),async(req,res)=>{
        res.render("hotel/home.ejs")
})


router.get("/waiterlogin",(req,res)=>{
    res.render("user/waiterlogin.ejs")
})
router.post("/waiterlogin",(req,res)=>{
    res.send("waiter")

})

router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs")
})


router.post("/signup",async(req,res)=>{
try{
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

    newhotel.hoteldetails= newhoteldetail

    await newhoteldetail.save()
    await newhotel.save()

    res.send("success")
})


router.get("/login",(req,res)=>{
    res.render("user/managerlogin")
})

router.post("/login",
    passport.authenticate(
    "local",{
    failureRedirect:"/login",
    failureFlash:false}),
    (req,res)=>{
        res.render("hotel/home.ejs")
})

module.exports = router