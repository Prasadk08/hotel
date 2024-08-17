const express = require('express')
const Waiter = require('../models/waiter')
const router = express.Router({mergeParams:true})




router.get("/home",(req,res)=>{
    res.render("hotel/home.ejs")
})
router.post("/home",(req,res)=>{
    res.render("hotel/home.ejs")
})

router.get("/addwaiter",(req,res)=>{
    res.render("hotel/addwaiter.ejs")
})
router.post("/addwaiter",async(req,res)=>{
    let{name,phno}=req.body.waiter
    let newwaiter = new Waiter({name,phno})
    await newwaiter.save()
    res.render("hotel/services")
})


router.get("/addwaiter",(req,res)=>{
    res.render("hotel/addwaiter.ejs")
})
router.post("/addwaiter",(req,res)=>{
    let newwaiter = req.body.waiter
    console.log(res.locals.currUser)
    res.send("current User")
})


router.get("/services",async(req,res)=>{

    res.render("hotel/services.ejs")
})


module.exports = router