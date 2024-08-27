const express = require('express')
const router = express.Router({mergeParams:true})
const Hotel = require('../models/hotel')
const MenuCard = require('../models/menucard')
const Manager = require('../models/manager')
const menucard = require('../models/menucard')
const Waiter = require('../models/waiter')

let sortedObjects = {
    starters: [],
    soups: [],
    maincourse: [],
    breads: [],
    riceandbiryani: [],
    chinese: []
};
// let waiters = []
let check = true
let allwaiters=[]
let firstwaiter =0

router.get("/placeorder",async(req,res)=>{
    let {username}=req.user
    let newhoteldetail = await Manager.findOne({username}).populate("hoteldetails")
    newhoteldetail =newhoteldetail.hoteldetails

    const manager = await Manager.findByUsername(username).populate({
        path: 'hoteldetails',
        populate: {
            path: 'menucard'
        }
    });

    const hotelmenucard = await MenuCard.findById(manager.hoteldetails.menucard._id)
    const menuItems = [
        { id: '1', foodname: 'Burger', foodprice: '$5' },
        { id: '2', foodname: 'Pizza', foodprice: '$8' },
        // Add more items as needed
    ]
    let order = [1,2,2,12,21,21]
    res.render("kitchen/placeorder.ejs",{newhoteldetail,hotelmenucard,menuItems,order})
})

router.post("/placeorder", async (req, res) => {
    try {
        const order = req.body.order;  // Assume order is an array of objects with foodname, quantity, and type

        // Step 1: Initialize sortedObjects

        // Step 2: Process the order array
        order.forEach(orderItem => {
            const { foodname, quantity, type } = orderItem;

            if (type && sortedObjects[type]) {
                const existingItem = sortedObjects[type].find(item => item.foodname === foodname);

                if (existingItem) {
                    existingItem.foodquantity += quantity;
                } else {
                    sortedObjects[type].push({
                        foodname,
                        foodquantity: quantity
                    });
                }
            }
        });
        let waiters = await Waiter.countDocuments();
        // if(check){
        //     let waiters = await Waiter.countDocuments();
        //     for(let i=0;i<waiters;i++){
        //         let num = Math.floor(Math.random()*waiters)
        //         while(randomnumbers.includes(num)){
        //             num = Math.floor(Math.random()*waiters)
        //         }
        //         randomnumbers.push(num)
        //     }
        //     check=false

        // }
        
        const manager = await Manager.findByUsername(req.user.username).populate({
            path: 'hoteldetails',
            populate: {
                path: 'waiters'
            }
        });
        const hotel = manager.hoteldetails;
        allwaiters = hotel.waiters.map(waiter => waiter._id);
        console.log(waiters[firstwaiter])
        const newOrder = {
            tableno: 2, // You might want to get this dynamically
            waiterid: allwaiters[firstwaiter], // Assign a waiter ID
            orderedfood: order
        };
        hotel.orders.push(newOrder)


        if(firstwaiter<allwaiters.length-1){
            firstwaiter++
        }else{
            firstwaiter=0
        }
        hotel.save()
        console.log(hotel.orders)

        // Return a success response with the sortedObjects or handle further processing
        res.json({ success: true, sortedObjects });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
});


router.get("/kitchenstatus",async(req,res)=>{
    let {username}=req.user
    let newhoteldetail = await Manager.findOne({username}).populate("hoteldetails")
    newhoteldetail =newhoteldetail.hoteldetails
    res.render("kitchen/kitchenstatus.ejs",{newhoteldetail,sortedObjects})
})

router.get("/addmenucardform",async(req,res)=>{
    let {username}=req.user
    let newhoteldetail = await Manager.findOne({username}).populate("hoteldetails")
    newhoteldetail =newhoteldetail.hoteldetails
    res.render("hotel/menucardform.ejs",{newhoteldetail})
})

router.post("/addmenucard",async(req,res)=>{
    let {username}=req.user
    const manager = await Manager.findByUsername(username).populate({
        path: 'hoteldetails',
        populate: {
            path: 'menucard'
        }
    });

    const hotelmenucard = await MenuCard.findById(manager.hoteldetails.menucard._id)

    let {item,foodname,foodprice} = req.body.menu

    hotelmenucard[item].push({foodname,foodprice})

    await hotelmenucard.save()
    await manager.hoteldetails.save()
    await manager.save()

    res.redirect("/hotel/services")
})

router.get("/showmenucard",async(req,res)=>{
    let {username}=req.user
    let newhoteldetail = await Manager.findOne({username}).populate("hoteldetails")
    newhoteldetail =newhoteldetail.hoteldetails

    const manager = await Manager.findByUsername(username).populate({
        path: 'hoteldetails',
        populate: {
            path: 'menucard'
        }
    });

    const hotelmenucard = await MenuCard.findById(manager.hoteldetails.menucard._id)
    for(data of hotelmenucard["maincourse"]){
        console.log(data)
    }
    for(data of res.locals.foodCategory){
        console.log(data)
    }
    res.render("kitchen/showmenucard.ejs",{newhoteldetail,hotelmenucard})
})

router.get("/myservings",async(req,res)=>{
    console.log(req.user)
    let {username}=req.user
    let newhoteldetail = await Manager.findOne({username}).populate("hoteldetails")
    let orders=newhoteldetail.hoteldetails.orders
    res.render("kitchen/myservings.ejs",{orders})
})

router.get("/test",(req,res)=>{

    res.send("success")
})


module.exports = router