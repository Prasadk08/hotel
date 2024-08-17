const express = require('express')
const { default: mongoose } = require('mongoose')
const app= express()
const hotel = require('./models/hotel')
const path = require('path')
const ejsMate = require('ejs-mate')
const passport = require('passport')
const localStrategy = require('passport-local')
const Manager = require('./models/manager')
const Waiter = require('./models/waiter')
const session = require('express-session')
const MongoStore =  require('connect-mongo')

const hotelRoute = require('./route/hotel')
const kitcheRoute = require('./route/kitchen')
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

const store = MongoStore.create({
    mongoUrl:"mongodb://127.0.0.1:27017/hotel",
    crypto:{
        secret:"prasadkhirsagar"
    },
    touchAfter:24 * 3600
})

store.on("error",()=>{
    console.log("Error in Mongo Session store ",err)
})



const sessionOption={
    store,
    secret:"prasadkhirsagar",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true
    }
}

app.use(session(sessionOption))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new localStrategy(Manager.authenticate()))
passport.serializeUser(Manager.serializeUser())
passport.deserializeUser(Manager.deserializeUser())


passport.use(new localStrategy(Waiter.authenticate()))
passport.serializeUser(Waiter.serializeUser())
passport.deserializeUser(Waiter.deserializeUser())

app.use((req,res,next)=>{
    res.locals.currUser = req.user
    next()
})

app.use("/hotel",hotelRoute)
app.use("/kitchen",kitcheRoute)
app.use("/",userRoute)

app.get("/",async(req,res)=>{
    res.render("index.ejs")
})


