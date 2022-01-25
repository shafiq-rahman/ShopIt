const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ImageSchema = new Schema({
    url: String
})

const productSchema = new Schema({
    name: String,
    category: {
        type: String,
        enum: ["Tablets","Smartphones","Laptops","Desktops"]
    },
    color: String,
    brand: String,
    model: String,
    price: Number,
    rating: Number,
    description: String,
    images: [ImageSchema],
    qty: Number
})

const Product = mongoose.model("Product", productSchema)
module.exports = Product


