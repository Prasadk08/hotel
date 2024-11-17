const express = require('express')
const router = express.Router({mergeParams:true})
const Hotel = require('../models/hotel')
const MenuCard = require('../models/menucard')
const menucard = require('../models/menucard')

const User = require("../models/user");


router.get("/addmenucardform",async(req,res)=>{
    let {username}=req.user
    let newhoteldetail = await User.findOne({username}).populate("hotelid")
    newhoteldetail =newhoteldetail.hotelid
    res.render("hotel/menucardform.ejs",{newhoteldetail})
})

router.post("/addmenucard",async(req,res)=>{
    let {username}=req.user
    const manager = await User.findByUsername(username).populate({
        path: 'hotelid',
        populate: {
            path: 'menucard'
        }
    });

    const hotelmenucard = await MenuCard.findById(manager.hotelid.menucard._id)

    let {item,foodname,foodprice} = req.body.menu

    hotelmenucard[item].push({foodname,foodprice})

    await hotelmenucard.save()
    await manager.hotelid.save()
    await manager.save()

    res.redirect("/hotel/services")
})

router.get("/showmenucard",async(req,res)=>{
    let {username}=req.user
    let newhoteldetail = await User.findOne({username}).populate("hotelid")
    newhoteldetail =newhoteldetail.hotelid

    const manager = await User.findByUsername(username).populate({
        path: 'hotelid',
        populate: {
            path: 'menucard'
        }
    });

    const hotelmenucard = await MenuCard.findById(manager.hotelid.menucard._id)
    
    res.render("kitchen/showmenucard.ejs",{newhoteldetail,hotelmenucard})
})

router.get("/myservings",async(req,res)=>{

    if(req.user.role=="Manager"){
        req.flash("error","Only Waiters can access")
        return res.redirect("/hotel/home")
    }

    let waiter = await User.findById(req.user.id)

    let orders= waiter.myservings

    res.render("kitchen/myservings.ejs",{orders})
})


router.get("/currentorders",async(req,res)=>{

    let {username}=req.user
    let orders,newhoteldetail

    newhoteldetail = await Hotel.findById(req.user.hotelid)
    orders= newhoteldetail.orders

    res.render("kitchen/currentorders.ejs",{orders})
})

router.post("/cancelorder",async(req,res)=>{
    const order = req.body.order
    const orderid = req.body.foodid
    const neworder = order.orderedfood.filter((food)=> food.id.toString() != orderid.toString())

    order.orderedfood=neworder

    let {username}=req.user
    let orders,newhoteldetail

    newhoteldetail = await Hotel.findById(req.user.hotelid)
    orders= newhoteldetail.orders

    const oldorders = orders.filter((oldorder)=> oldorder._id.toString() != order._id)
    oldorders.push(order)
    newhoteldetail.orders=oldorders
    await newhoteldetail.save()

    res.redirect(`/waiter/editorder/${order._id}`);

})


module.exports = router