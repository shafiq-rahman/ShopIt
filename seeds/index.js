const mongoose = require("mongoose")
const Product = require("../models/product")
const { products } = require("./seedHelpers")
mongoose.connect("mongodb://localhost:27017/shopit")
    .then(() => {
        console.log("MONGODB CONNECTION ON")
    })
    .catch((err) => {
        console.log("FAILED TO CONNECT MONGODB")
        console.log(err)
    })

const randomColor = () => {
    const color = ["White","Black", "Green","Gray","Blue"]
    return color[Math.floor(Math.random() * color.length)]
}

const seedDb = async () => {
    //Smartphones
    // console.log(products)
    await Product.deleteMany({})
    for (let i = 0; i < products.length; i++){
        const item = products[i]
        const product = new Product({
            name: item.name,
            category: "Smartphones",
            color: randomColor(),
            brand: item.brand,
            model: item.model,
            price: item.price,
            rating: item.rating,
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Deleniti corporis dolor voluptatibus molestiae magni excepturi illo, perferendis voluptas nihil est eveniet numquam, quaerat cumque. Accusamus id rerum quo. Aut, quae!",
            images: item.images
        })
        await product.save()
    }
}

seedDb()
    .then(() => {
        mongoose.disconnect()
    })