const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const localStrategy = require('passport-local')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const hotelRoute = require('./route/hotel');
const kitchenRoute = require('./route/kitchen');
const waiterRoute = require('./route/waiter');
const userRoute = require('./route/user');
const User = require('./models/user');

const Hotel = require('./models/hotel');

if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

let mongoUrl = process.env.Atlas_Dburl
//  let mongoUrl = "mongodb://127.0.0.1:27017/hotel"

async function main() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connection is successful");
  } catch (err) {
    console.log("Cannot connect to database", err);
  }
}

main();

const app = express();
const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public', {
  maxAge: '1y'
}));

const store = MongoStore.create({
  mongoUrl: mongoUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Error in Mongo Session store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(async (req, res, next) => {
  res.locals.currentpage=req.originalUrl;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.foodCategory = ['starters', 'soups', 'maincourse', 'breads', 'riceandbiryani', 'chinese'];


  if (req.user && req.user.hotelid) {
    let data = await Hotel.findById(req.user.hotelid)
    req.session.testhotelname = data.hotelname;
  }

  res.locals.testhotelname = req.session.testhotelname || 'Prasad';
  next();
});

app.use("/hotel", hotelRoute);
app.use("/kitchen", kitchenRoute);
app.use("/waiter", waiterRoute);
app.use("/", userRoute);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.use((err, req, res, next) => {
  console.log("inside throw");
  console.log(err);
  let { status = 500, message = "Something Went Wrong" } = err;
  res.status(status).render("error.ejs", { message });
});

app.listen(port, () => {
  console.log(`Listening on Port ${port}`);
});