const express = require("express");
const router = express.Router({ mergeParams: true });
const Hotel = require("../models/hotel");
const MenuCard = require("../models/menucard");
const User = require("../models/user");

const mongoose = require("mongoose");
const user = require("../models/user");

let check = true;
let allwaiters = [];
let firstwaiter = 0;

router.get("/placeorder", async (req, res) => {

  if(req.user.role=="Waiter"){
    req.flash("error","Only Manager can Take Order")
    return res.redirect("/hotel/home")
  }


  let { username } = req.user;
  let newhoteldetail = await Hotel.findById(req.user.hotelid).populate(
    "sections"
  );

  res.render("order/placeorder.ejs", { sections: newhoteldetail.sections });

  // console.log(newhoteldetail.menucard)
  // const hotelmenucard = await MenuCard.findById(newhoteldetail.menucard)
  // const menuItems = []

  // res.render("kitchen/placeorder.ejs",{newhoteldetail,hotelmenucard,menuItems})
});

router.post("/placeorder", async (req, res) => {
  const order = req.body.order;
  const tableno = req.body.tableNumber;

  let waiters = await Waiter.countDocuments();

  const manager = await User.findByUsername(req.user.username).populate({
    path: "hotelid",
    populate: {
      path: "waiters",
    },
  });
  const hotel = manager.hotelid;
  allwaiters = hotel.waiters.map((waiter) => waiter._id);

  const newOrder = {
    tableno: tableno,
    waiterid: allwaiters[firstwaiter],
    orderedfood: order,
  };
  hotel.orders.push(newOrder);

  if (firstwaiter < allwaiters.length - 1) {
    firstwaiter++;
  } else {
    firstwaiter = 0;
  }
  hotel.save();

  res.json({ success: true });
});

router.get("/takeorder/:i/:section", async (req, res) => {


  let { username } = req.user;

  let { i,section } = req.params;

  const manager = await User.findByUsername(username).populate("hotelid");
  const hotel = await Hotel.findById(manager.hotelid._id).populate("menucard").populate("waiters")
  if(hotel.waiters.length<=0){
    req.flash("error","Please add some waiter First")
    return res.redirect('/hotel/addwaiter')
  }

  let order = hotel.orders.find((order) => Number(order.tableno) === Number(i));

  hotelmenucard = hotel.menucard;

  res.render("order/takeorder.ejs", { hotelmenucard, order, i ,section});
});

router.post("/takeorder/:i/:section", async (req, res) => {

  const { order, tableNumber } = req.body;
  const {section} = req.params

  const { username } = req.user;
  const manager = await User.findByUsername(username).populate("hotelid");
  const hotel = await Hotel.findById(manager.hotelid._id);

  // Find the existing order for the given table number
  const oldorder = hotel.orders.find(
    (o) => o.tableno.toString() === tableNumber
  );

  const allwaiters = hotel.waiters.map(waiter => waiter._id);
  if (oldorder) {

    const waiter = await User.findById(oldorder.waiterid);
    const item = waiter.myservings.find(serving => serving.tableno.toString() === tableNumber.toString());
    if(item){
      item.serving.push(order)
    }
    waiter.markModified("myservings")
    await waiter.save()

    for (const newItem of order) {
      // Check if the item exists in the orderedfood array
      const existingFoodItem = oldorder.orderedfood.find(
        (item) => item.id === newItem.id
      );
      if (existingFoodItem) {
        existingFoodItem.quantity += newItem.quantity;
      } else {
        // If it doesn't exist, add it to the orderedfood array
        oldorder.orderedfood.push(newItem);
      }
    }
    hotel.markModified("orders");
  } else {

    hotel.orders.push({
      section:section,
      tableno: tableNumber,
      orderedfood: order,
      waiterid: allwaiters[firstwaiter],
    });

    const waiter = await User.findById(allwaiters[firstwaiter]);

    waiter.myservings.push({ cancelleditems:[], tableno: tableNumber, serving: [order],section:section});
    await waiter.save()
  }
  if (firstwaiter < allwaiters.length - 1) {
    firstwaiter++;
  } else {
    firstwaiter = 0;
  }
  req.flash("success","Order placed successfully")

  await hotel.save();

  res.status(200).json({ message: "Order placed successfully" });
});

router.get("/showorder/:tableno",async(req,res)=>{
  let {tableno}=req.params
  let waiter = await User.findById(req.user.id)
  const order = waiter.myservings.find(serving => serving.tableno.toString() === tableno.toString());
  res.render("order/showorder.ejs",{order})

})



router.get("/editorder/:orderId", async (req, res) => {
  console.log("in Post route 2")
  
  let { username } = req.user;
  let { orderId } = req.params;

  const manager = await User.findByUsername(username).populate("hotelid");
  const hotel = await Hotel.findById(manager.hotelid._id).populate("menucard");

  let order = hotel.orders.find((order) => order._id.toString() === orderId);

  res.render("kitchen/editorder.ejs", {order});
});

router.post("/editorder/:foodname/:foodquantity", async (req, res) => {
  const { order, orderId } = req.body;
  const { foodname, foodquantity } = req.params;

  const hotel = await Hotel.findById(req.user.hotelid);

  const orders = hotel.orders.filter(
    (allorder) => allorder._id.toString() !== orderId.toString()
  );

  const waiter = await User.findById(order.waiterid);
  const item = waiter.myservings.find(serving => serving.tableno.toString() === order.tableno.toString());

  const quantityToCancel = parseInt(foodquantity);

  // Find existing canceled item in `cancelleditems` for this food
  const existingCancelItem = item.cancelleditems.find(cancelItem =>
    cancelItem.startsWith(foodname)
  );

  if (existingCancelItem) {

    const existingQuantity = parseInt(existingCancelItem.match(/(\d+)X/)?.[1]) || 1;
    const newQuantity = existingQuantity + quantityToCancel;

    const newCancelEntry = `${foodname} ${newQuantity}X is cancelled`;
    item.cancelleditems[item.cancelleditems.indexOf(existingCancelItem)] = newCancelEntry;
  } else {
    // No existing item, add a new cancel entry
    const newCancelEntry = quantityToCancel > 1
      ? `${foodname} ${quantityToCancel}X is cancelled`
      : `${foodname} is cancelled`;

    item.cancelleditems.push(newCancelEntry);
  }
  await waiter.save();

  if (order.orderedfood.length >= 1) {
    orders.push(order);
    hotel.orders = orders;
  } else {

    await User.findOneAndUpdate(
      { _id: waiter._id },
      { $pull: { myservings: { tableno: order.tableno } } },
      { new: true }
  );

    await Hotel.updateOne(
      { _id: req.user.hotelid },
      { $pull: { orders: { _id: orderId } } }
    );
  }
  req.flash("success","Order Edited Successfully")

  waiter.markModified("myservings");

  await hotel.save();

  res.redirect(`/waiter/editorder/${order._id}`);
});

module.exports = router
