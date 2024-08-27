const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const hotelRoute = require('./route/hotel');
const kitchenRoute = require('./route/kitchen');
const userRoute = require('./route/user');
const Manager = require('./models/manager');
const Waiter = require('./models/waiter');

if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

async function main() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/hotel');
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

const store = MongoStore.create({
  mongoUrl: "mongodb://127.0.0.1:27017/hotel",
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

app.use(session(sessionOptions));

passport.use('manager-local', new LocalStrategy(Manager.authenticate()));
passport.use('waiter-local', new LocalStrategy(Waiter.authenticate()));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Manager.findByUsername(id) || await Waiter.findByUsername(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(async (req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.foodCategory = ['starters', 'soups', 'maincourse', 'breads', 'riceandbiryani', 'chinese'];
  console.log('Current User:', req.user);

  if (req.isAuthenticated() && req.user) {
    if (req.user.role === "Manager") {
      let data = await Manager.findByUsername(req.user.username).populate('hoteldetails');
      req.session.testhotelname = data.hoteldetails.hotelname;
    } else if (req.user.role === 'waiter') {
      let data2 = await Waiter.findByUsername(req.user.username).populate('hotelid');
      req.session.testhotelname = data2.hotelid.hotelname;
    }
    console.log('Hotel Name in Session:', req.session.testhotelname);
  }
  res.locals.testhotelname = req.session.testhotelname || 'Default Hotel Name';
  next();
});

app.use("/hotel", hotelRoute);
app.use("/kitchen", kitchenRoute);
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