const express = require('express')
const Waiter = require('../models/waiter')
const Hotel = require('../models/hotel')
const Manager = require('../models/manager')
const router = express.Router({mergeParams:true})
const{isLoggedIn}=require('../middleware')
const{hotelname} = require('../middleware')


router.get("/services",async(req,res)=>{
    let {username}=req.user
    let newhoteldetail = await Manager.findOne({username}).populate("hoteldetails")
    newhoteldetail =newhoteldetail.hoteldetails
    res.render("hotel/services.ejs",{newhoteldetail})
})


router.get("/home",async(req,res)=>{
    let {username}= req.user
    let newhoteldetail = await Manager.findOne({username}).populate("hoteldetails")
    newhoteldetail =newhoteldetail.hoteldetails
    res.render("hotel/home.ejs",{newhoteldetail})
})

router.post("/home",(req,res)=>{

    res.render("hotel/home.ejs")
})

router.get("/addwaiter",isLoggedIn,async(req,res)=>{
    let {username}= req.user
    let newhoteldetail = await Manager.findOne({username}).populate("hoteldetails")
    newhoteldetail =newhoteldetail.hoteldetails
    res.render("hotel/addwaiter.ejs",{newhoteldetail})
})

router.post("/addwaiter",async(req,res)=>{
    let{name,phno,username,password}=req.body.waiter

    let newwaiter = new Waiter({name,phno,username,role: 'Waiter'})
    await Waiter.register(newwaiter,password)
    

    let {hoteldetails}=res.locals.currUser
    let hotelinfo = await Hotel.findById(hoteldetails)

    newwaiter.hotelid=hotelinfo._id

    hotelinfo.waiters.push(newwaiter)

    await newwaiter.save()
    await hotelinfo.save()
    console.log(hotelinfo)

    res.redirect("/hotel/home")
})


router.get("/addwaiter",(req,res)=>{
    res.render("hotel/addwaiter.ejs")
})



module.exports = router