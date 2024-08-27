if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}


const express = require('express')
const { default: mongoose } = require('mongoose')
const app= express()
const hotel = require('./models/hotel')
const path = require('path')
const ejsMate = require('ejs-mate')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const Waiter = require('./models/waiter')
const Manager = require('./models/manager')
const session = require('express-session')
const MongoStore =  require('connect-mongo')
const flash = require('connect-flash')

const hotelRoute = require('./route/hotel')
const kitchenRoute = require('./route/kitchen')
const userRoute = require('./route/user')

main()
    .then((req)=>{
        console.log("connection is successful")
    })
    .catch((req)=>{
        console.log("Cannot connect to database")
    })

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/hotel')
}

const port = 8080


app.listen(port,()=>{
    console.log("Listening on Port 8080")
})

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname,"public")))
app.use(express.urlencoded({extended:true}))
app.use(express.json());

const store = MongoStore.create({
    mongoUrl:"mongodb://127.0.0.1:27017/hotel",
    crypto: {  // prefered to use for encryption
        secret: process.env.SECRET,
    },
    touchAfter:24 * 3600
})

store.on("error",()=>{
    console.log("Error in Mongo Session store ",err)
})



const sessionOption={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true
    }
}

app.use(session(sessionOption))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
// passport.use(new localStrategy(Manager.authenticate()))
// passport.serializeUser(Manager.serializeUser())
// passport.deserializeUser(Manager.deserializeUser())

passport.use('manager-local', new LocalStrategy(Manager.authenticate()));
passport.use('waiter-local', new LocalStrategy(Waiter.authenticate()));

passport.serializeUser(Manager.serializeUser())
passport.serializeUser(Waiter.serializeUser());

passport.deserializeUser(Manager.deserializeUser());
passport.deserializeUser(Waiter.deserializeUser());

app.use(async(req,res,next)=>{
    res.locals.success= req.flash("success")
    res.locals.error= req.flash("error")
    res.locals.currUser = req.user
    res.locals.foodCategory = ['starters', 'soups', 'maincourse', 'breads', 'riceandbiryani', 'chinese'];
    console.log('Current User:', req.user);

    if (req.isAuthenticated() && req.user) {
        if (req.user.role == "Manager") {
            let data = await Manager.findByUsername(req.user.username).populate('hoteldetails');
            req.session.testhotelname = data.hoteldetails.hotelname;
        } else if (req.user.role === 'waiter') {
            let data2 = await Waiter.findByUsername(req.user.username).populate('hotelid');
            req.session.testhotelname = data2.hotelid.hotelname;
        }
        console.log('Hotel Name in Session:', req.session.testhotelname);
    }
     res.locals.testhotelname = req.session.testhotelname || 'Default Hotel Name'
    next();
})

app.use("/hotel",hotelRoute)
app.use("/kitchen",kitchenRoute)
app.use("/",userRoute)

app.get("/",async(req,res)=>{
    res.render("index.ejs")
})

app.use((err,req,res,next)=>{
    console.log("inside throw")
    console.log(err)
    let{status=500,message="Something Went Wrong"}=err
    res.status(status).render("error.ejs",{message})
    // res.status(status).send(message)
})


