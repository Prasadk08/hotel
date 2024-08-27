const mongoose = require('mongoose');
const {Schema}= mongoose;

const menucardSchema = new Schema({
    starters: [{
        foodname:String,
        foodprice:Number
    }],
    soups: [{
        foodname:String,
        foodprice:Number
    }],
    maincourse: [{
        foodname:String,
        foodprice:Number
    }],
    breads: [{
        foodname:String,
        foodprice:Number
    }],
    riceandbiryani: [{
        foodname:String,
        foodprice:Number
    }],
    chinese: [{
        foodname:String,
        foodprice:Number
    }]
})

module.exports = mongoose.model("MenuCard",menucardSchema)
