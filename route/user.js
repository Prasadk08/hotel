const express = require('express')
const router = express.Router({mergeParams:true})
const passport = require('passport')
const Manager = require('../models/manager')
const Hotel = require('../models/hotel')
const{uniqueUsername,validatehotel} = require('../middleware')
const Waiter = require('../models/waiter')
const MenuCard = require('../models/menucard')




// router.get("/managerlogin",(req,res)=>{
//     res.render("user/managerlogin.ejs")
// })


router.post("/login",
    passport.authenticate("user-local", {
        failureRedirect: "/login",
        failureFlash: false
    }),
    async (req, res) => {
        // let { username } = req.body;
        // let newhoteldetail = await Manager.findOne({ username }).populate("hoteldetails");
        // newhoteldetail = newhoteldetail.hoteldetails;

        req.session.save((err) => {
            if (err) console.log('Session save error:', err);
        });

        let {username}=req.body
        let newhoteldetail = await Waiter.findOne({username}).populate("hotelid")

        newhoteldetail =newhoteldetail.hotelid
        
        req.session.save((err) => {
            if (err) console.log('Session save error:', err);
        });
        req.flash("success","Welcome to Services")
        res.render("hotel/home.ejs",,{newhoteldetail});
    }
);


// router.post("/waiterlogin",
//     passport.authenticate(
//     "waiter-local",{
//     failureRedirect:"/waiterlogin",
//     failureFlash:false}),
//     async(req,res)=>{
//         let {username}=req.body
//         let newhoteldetail = await Waiter.findOne({username}).populate("hotelid")

//         newhoteldetail =newhoteldetail.hotelid
        
//         req.session.save((err) => {
//             if (err) console.log('Session save error:', err);
//         });
//         req.flash("success","Welcome to Services")
//         res.render("hotel/home",{newhoteldetail})
//     }
// )

router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs")
})


router.post("/signup",uniqueUsername,async(req,res)=>{
try{
    let{email,username,password}=req.body
    let newuser = new Manager({email,username,role: 'Manager'})
    await Manager.register(newuser,password)
    req.login(newuser,(err)=>{
        if(err){
            console.log("user is not registered")
        }else{
            res.redirect(`/signupform/${newuser._id}`)
        }
    })
}
catch(err){
    console.log(err)
    console.log("user is not not registerd")
    res.render("user/signup")
}
})

router.get("/signupform/:id",(req,res)=>{
    let {id}=req.params
    res.render("user/signupform.ejs",{id})
})


router.post("/signupform/:id",validatehotel,async(req,res)=>{
    let {id}=req.params
    let newhotel = await Manager.findById(id)

    let newhoteldetail = new Hotel({
        ...req.body.manager,
        dailybills: [{ date: new Date(), todaysbill: [] }],
        sections: []
    });
    let newmenucard = new MenuCard({})

    newhotel.hotelid= newhoteldetail
    newhoteldetail.menucard = newmenucard

    if (req.body.manager.sections) {
        for (const section of req.body.manager.sections) {
            newhoteldetail.sections.push(section); // Store section details directly in Hotel
        }
    }


    await newmenucard.save()
    await newhoteldetail.save()

    await newhotel.save();

    res.locals.testhotelname = req.body.manager.hotelname;
    req.flash("success","Welcome to Restaurant Management")
    res.render("hotel/home.ejs", { newhoteldetail });
})

router.get("/logout", async (req, res, next) => {

    req.logout((err)=>{
        if(err){
            return next(err)
        }else{
            // req.flash("success","You are successfully logout")
            req.flash("success","You logged out Successfully")
            res.redirect("/")
        }
    })
});

module.exports = router