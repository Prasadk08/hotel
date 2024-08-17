const express = require('express')
const router = express.Router({mergeParams:true})


router.get("/placeorder",(req,res)=>{
    res.render("hotel/placeorder.ejs")
})

router.get("/kitchenstatus",(req,res)=>{
    res.render("hotel/kitchenstatus.ejs")
})

router.get("/menucardform",(req,res)=>{
    res.render("hotel/menucardform.ejs")
})

router.get("/showmenucard",(req,res)=>{
    res.render("hotel/showmenucard.ejs")
})

module.exports = router