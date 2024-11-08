const express = require('express')
const Waiter = require('../models/waiter')
const Hotel = require('../models/hotel')
const Manager = require('../models/manager')
const User = require('../models/user')
const router = express.Router({mergeParams:true})
const{isLoggedIn,validatewaiter}=require('../middleware')
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
    let {username}= req.user
    let newhoteldetail = await User.findOne({username}).populate("hotelid")
    newhoteldetail =newhoteldetail.hotelid
    res.render("hotel/home.ejs",{newhoteldetail})
})

router.post("/home",(req,res)=>{

    res.render("hotel/home.ejs")
})

router.get("/addwaiter",isLoggedIn,async(req,res)=>{
    let {username}= req.user
    let newhoteldetail = await User.findOne({username}).populate("hotelid")
    newhoteldetail =newhoteldetail.hotelid
    res.render("hotel/addwaiter.ejs",{newhoteldetail})
})

router.get("/addwaiter",(req,res)=>{
    res.render("hotel/addwaiter.ejs")
})

router.post("/addwaiter",validatewaiter,async(req,res)=>{
    let{name,phno,username,password}=req.body.waiter

    let newwaiter = new Waiter({name,phno})
    await Waiter.save(newwaiter);

    let newuser = new User({username,role:'Waiter'})
    await User.register(newuser,password)
    

    let {hotelid}=res.locals.currUser
    let hotelinfo = await Hotel.findById(hotelid)

    newwaiter.hotelid=hotelinfo._id

    hotelinfo.waiters.push(newwaiter)

    await newwaiter.save()
    await hotelinfo.save()
    req.flash("success","New waiter Added")
    res.redirect("/home")
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
    const waiter = await Waiter.findById(order.waiterid);
    if (waiter) {
        // Remove the serving from the waiter's myservings without causing VersionError
        await Waiter.findOneAndUpdate(
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

    // Remove the order from the hotel's orders array and ensure no VersionError
    await Hotel.findOneAndUpdate(
        { _id: hotel._id },
        { $pull: { orders: { _id: orderObjectId } } },
        { new: true }
    );

    // Render the bill page with the calculated total and waiter name
    res.render("payment/bill.ejs", { order, totalBill, waitername });

});


module.exports = router