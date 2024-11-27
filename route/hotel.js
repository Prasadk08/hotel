const express = require('express')
const Hotel = require('../models/hotel')
const User = require('../models/user')
const router = express.Router({mergeParams:true})
const{isLoggedIn,validatewaiter,uniqueUsername2}=require('../middleware')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;  // Import ObjectId from mongoose

const{hotelname} = require('../middleware')


router.get("/services",async(req,res)=>{

    let {username}=req.user
    let newhoteldetail = await User.findOne({username}).populate("hotelid")
    newhoteldetail =newhoteldetail.hotelid
    res.render("hotel/services.ejs",{newhoteldetail})
})


router.get("/home",async(req,res)=>{

    let username,newhoteldetail;
    if(req.user){
        username= req.user.username
        newhoteldetail = await User.findOne({username}).populate("hotelid")
        let allwaiterdata=[]
        for(let waiter of newhoteldetail.hotelid.waiters){
            allwaiterdata.push(await User.findById(waiter))
        }
        newhoteldetail =newhoteldetail.hotelid
    }

    res.render("hotel/home.ejs",{newhoteldetail,allwaiterdata})
})

router.get("/profile",async(req,res)=>{
    let username;
    if(req.user){
        username= req.user.username
    }
    let newhoteldetail = await User.findOne({username}).populate("hotelid")
    newhoteldetail =newhoteldetail.hotelid

    res.render("hotel/profile.ejs",{newhoteldetail})
})

router.get("/addwaiter",isLoggedIn,async(req,res)=>{
    let {username}= req.user
    let newhoteldetail = await User.findOne({username}).populate("hotelid")
    newhoteldetail =newhoteldetail.hotelid
    res.render("hotel/addwaiter.ejs",{newhoteldetail})
})


router.post("/addwaiter",uniqueUsername2,validatewaiter,async(req,res)=>{
    let{name,username,phno,password}=req.body.waiter

    let newuser = new User({name,username,role:'Waiter'})
    await User.register(newuser,password)


    let {hotelid}=res.locals.currUser
    let hotelinfo = await Hotel.findById(hotelid)

    newuser.hotelid=hotelinfo._id
    newuser.myservings=[]

    hotelinfo.waiters.push(newuser)

    await newuser.save()
    await hotelinfo.save()
    req.flash("success","New waiter Added")
    res.redirect("/hotel/home")
})


router.get('/payment/bill/:orderId', async (req, res) => {

    const { orderId } = req.params;
    const orderObjectId = new ObjectId(orderId);

    // Find the hotel and the specific order within the hotel
    const hotel = await Hotel.findOne({ 'orders._id': orderObjectId });
    if (!hotel) {
        req.flash("error", "Hotel or order not found");
        return res.redirect("/hotel/home");
    }

    const order = hotel.orders.find(order => order._id.equals(orderObjectId));
    if (!order) {
        req.flash("error", "Bill is already created for this table");
        return res.redirect("/hotel/home");
    }

    // Find the waiter associated with the order
    const waiter = await User.findById(order.waiterid);
    if (waiter) {
        // Remove the serving from the waiter's myservings without causing VersionError
        await User.findOneAndUpdate(
            { _id: waiter._id }, 
            { $pull: { myservings: { tableno: order.tableno } } },
            { new: true }  // Ensure the latest version is used
        );
    }

    // Calculate the total bill
    let totalBill = 0;
    order.orderedfood.forEach(item => {
        if (!item.foodprice || !item.quantity) {
            throw new Error('Invalid item data in orderedfood array');
        }
        totalBill += item.foodprice * item.quantity;
    });

    // Handle daily bill entry
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for date comparison

    let todayBillEntry = hotel.dailybills.find(bill => bill.date.getTime() === today.getTime());

    if (todayBillEntry) {
        // If today's entry exists, update it with the new totalBill
        await Hotel.findOneAndUpdate(
            { _id: hotel._id, 'dailybills.date': today },
            { $push: { 'dailybills.$.todaysbill': totalBill } },
            { new: true }
        );
    } else {
        // If today's entry doesn't exist, create a new one
        await Hotel.findByIdAndUpdate(
            hotel._id,
            { $push: { dailybills: { date: today, todaysbill: [totalBill] } } },
            { new: true }
        );
    }

    const waitername = waiter ? waiter.name : 'Unknown Waiter';

    await Hotel.findOneAndUpdate(
        { _id: hotel._id },
        { $pull: { orders: { _id: orderObjectId } } },
        { new: true }
    );

    res.render("payment/bill.ejs", { order, totalBill, waitername });

});


module.exports = router