const express = require("express");
const router = express.Router({ mergeParams: true });
const Hotel = require("../models/hotel");
const MenuCard = require("../models/menucard");
const Manager = require("../models/manager");
const menucard = require("../models/menucard");
const Waiter = require("../models/waiter");
const mongoose = require("mongoose");

let check = true;
let allwaiters = [];
let firstwaiter = 0;

router.get("/placeorder", async (req, res) => {
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

  const manager = await Manager.findByUsername(req.user.username).populate({
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

router.get("/takeorder/:i", async (req, res) => {
  let { username } = req.user;

  let { i } = req.params;

  const manager = await Manager.findByUsername(username).populate("hotelid");
  const hotel = await Hotel.findById(manager.hotelid._id).populate("menucard").populate("waiters")

  let order = hotel.orders.find((order) => Number(order.tableno) === Number(i));


  hotelmenucard = hotel.menucard;
  res.render("order/takeorder.ejs", { hotelmenucard, order, i });
});

router.post("/takeorder/:i", async (req, res) => {
  const { order, tableNumber } = req.body;

  const { username } = req.user;
  const manager = await Manager.findByUsername(username).populate("hotelid");
  const hotel = await Hotel.findById(manager.hotelid._id);

  // Find the existing order for the given table number
  const oldorder = hotel.orders.find(
    (o) => o.tableno.toString() === tableNumber
  );

  const allwaiters = hotel.waiters.map(waiter => waiter._id);
  if (oldorder) {

    const waiter = await Waiter.findById(oldorder.waiterid);
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
    // If the table number doesn't exist, create a new order
    hotel.orders.push({
      tableno: tableNumber,
      orderedfood: order,
      waiterid: allwaiters[firstwaiter],
    });
    const waiter = await Waiter.findById(allwaiters[firstwaiter]);

    waiter.myservings.push({ cancelleditems:[], tableno: tableNumber, serving: [order] });
    await waiter.save()
  }
  if (firstwaiter < allwaiters.length - 1) {
    firstwaiter++;
  } else {
    firstwaiter = 0;
  }

  // Save the updated hotel document back to the database
  await hotel.save();

  res.status(200).json({ message: "Order placed successfully" });
});

router.get("/showorder/:tableno",async(req,res)=>{
  let {tableno}=req.params
  let waiter = await Waiter.findById(req.user.id)
  const order = waiter.myservings.find(serving => serving.tableno.toString() === tableno.toString());
  res.render("order/showorder.ejs",{order})

})



router.get("/editorder/:orderId", async (req, res) => {
  console.log("in Post route 2")
  let { username } = req.user;
  let { orderId } = req.params;

  const manager = await Manager.findByUsername(username).populate("hotelid");
  const hotel = await Hotel.findById(manager.hotelid._id).populate("menucard");

  let order = hotel.orders.find((order) => order._id.toString() === orderId);


  res.render("kitchen/editorder.ejs", {order});
});

router.post("/editorder/:foodname/:foodquantity", async (req, res) => {
  const { order, orderId } = req.body;
  const { foodname, foodquantity } = req.params;

  const hotel = await Hotel.findById(req.user.hotelid);

  // Filter out the order with the given orderId
  const orders = hotel.orders.filter(
    (allorder) => allorder._id.toString() !== orderId.toString()
  );

  const waiter = await Waiter.findById(order.waiterid);
  const item = waiter.myservings.find(serving => serving.tableno.toString() === order.tableno.toString());

  const quantityToCancel = parseInt(foodquantity);

  // Find existing canceled item in `cancelleditems` for this food
  const existingCancelItem = item.cancelleditems.find(cancelItem =>
    cancelItem.startsWith(foodname)
  );

  if (existingCancelItem) {
    // Parse current canceled quantity
    const existingQuantity = parseInt(existingCancelItem.match(/(\d+)X/)?.[1]) || 1;
    const newQuantity = existingQuantity + quantityToCancel;

    // Update `cancelleditems` with the new quantity
    const newCancelEntry = `${foodname} ${newQuantity}X is cancelled`;
    item.cancelleditems[item.cancelleditems.indexOf(existingCancelItem)] = newCancelEntry;
  } else {
    // No existing item, add a new cancel entry
    const newCancelEntry = quantityToCancel > 1
      ? `${foodname} ${quantityToCancel}X is cancelled`
      : `${foodname} is cancelled`;

    item.cancelleditems.push(newCancelEntry);
  }

  if (order.orderedfood.length >= 1) {
    orders.push(order);
    hotel.orders = orders;
  } else {
    await Hotel.updateOne(
      { _id: req.user.hotelid },
      { $pull: { orders: { _id: orderId } } }
    );
  }

  waiter.markModified("myservings");
  await waiter.save();
  await hotel.save();

  // Redirect to a route that renders the updated order page
  res.redirect(`/waiter/editorder/${order._id}`);
});

module.exports = router
