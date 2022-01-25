if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express")
const app = express();
const path = require("path")
const ejsMate = require("ejs-mate")
const mongoose = require("mongoose");
const Product = require("./models/product");
const methodOverride = require("method-override")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const flash = require("connect-flash")
var MongoStore = require("connect-mongo")

const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`LISTENING TO PORT ${port}`)
})
//"mongodb+srv://shafiq:db_us_shaf20@cluster0.hp0n2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/shopit" 
//Mongoose Connection
mongoose.connect(dbUrl)
    .then(() => {
        console.log("MONGODB CONNECTION ON")
    })
    .catch((err) => {
        console.log("FAILED TO CONNECT MONGODB")
        console.log(err)
    })

app.engine("ejs",ejsMate)
app.set("views", path.join(__dirname, "views"))
app.set("view engine","ejs")

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(cookieParser())

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: process.env.SECRET,
    touchAfter: 24 * 60 * 60
})

const sessionConfig = {
    store,
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true
    }
}


app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    next()
})

app.get("/", async (req, res) => {
    const topProducts = await Product.find({ rating: {$in : [5,4]} }).limit(4)
    const services = 1
    res.render("home", { topProducts , services })
})

app.get("/new", (req, res) => {
    res.render("shopit/new")
})

app.post("/new", async (req, res) => {
    const item = new Product(req.body.product)
    await item.save()
    res.redirect(`/${item.category}`)
})

app.get("/checkout/cart", async (req, res) => {
    const cartItems = req.cookies.cartItems
    var totalItems = 0
    if (cartItems) {
        var cartList = []
        var total = 0
        for (let i = 0; i < cartItems.length; i++) {
            const product = await Product.findById(cartItems[i].id)
            product.qty = cartItems[i].qty
            totalItems += product.qty
            total += product.price * cartItems[i].qty
            cartList.push(product)
        }
    }
    res.render("checkout/cart", { cartList, total,totalItems })
})

app.get("/checkout/cart/remove/:productId", (req, res) => {
    const { productId } = req.params
    var cartItems = req.cookies.cartItems
    if (cartItems) {
        cartItems = cartItems.filter( (obj) => obj.id !== productId )
    }
    res.clearCookie("cartItems");
    if(cartItems.length)
        res.cookie("cartItems", cartItems)
    res.redirect("/checkout/cart")
})

app.get("/checkout/shipping", async (req, res) => {
    var cartItems = req.cookies.cartItems
    var totalItems = 0
    if (cartItems) {
        var cartList = []
        var total = 0
        for (let i = 0; i < cartItems.length; i++) {
            const product = await Product.findById(cartItems[i].id)
            product.qty = cartItems[i].qty
            totalItems += product.qty
    
            total += product.price * cartItems[i].qty
            cartList.push(product)
        }
    }
    res.render("checkout/shipping", { cartList, total,totalItems })
})

app.get("/checkout/order", (req, res) => {
    res.render("checkout/order")
})

app.get("/addCart/:productId", (req, res) => {
    var cartItems = req.cookies.cartItems || []
    const { productId } = req.params
    const productQty  = parseInt(req.query.productQty)
    if (cartItems) {
        cartItems = addToCart(cartItems, productId,productQty)
    } else {
        cartItems.push({id: productId,qty: productQty })
    }
    req.flash("success", "Product added to cart successfully")
    res.cookie("cartItems", cartItems)
    res.redirect(`/smartphones/${productId}`)
})

function addToCart(cartItems, productId, productQty)  {
    var flag = 1
    for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].id === productId) {
            var qty = cartItems[i].qty 
            qty += productQty
    
            cartItems[i] = { id: productId, qty }
            flag = 0
        }
    }
    if (flag) {
        cartItems.push({ id: productId, qty: productQty })
    }
    return cartItems
}

app.get("/buynow/:productId", (req, res) => {
    var cartItems = req.cookies.cartItems || []
    const { productId } = req.params
    const productQty  = 1
    if (cartItems) {
        addToCart(cartItems, productId, productQty)
    } else {
        cartItems.push({id: productId,qty: 1 })
    }
    res.cookie("cartItems", cartItems)
    res.redirect("/checkout/cart")
})

app.get("/:cat", async (req, res) => {
    var { cat } = req.params
    if (!cat.localeCompare("smartphones")) {
        cat = cat.charAt(0).toUpperCase() + cat.slice(1)
        const products = await Product.find({})
        var brands = []
        for (let product of products) {
            if (!brands.includes(product.brand)) {
                brands.push(product.brand)
            }
        }
        res.render("shopit/index",{name:cat, products, brands})
    } else {
        res.redirect("/smartphones")
    }
    
})

app.get("/:cat/:id", async (req, res) => {
    const {id} = req.params
    const product = await Product.findById(id)
    const pname = product.name
    const similarProducts = await Product.find({ $and: [{ name: { $in: [pname] } }, { _id: { $ne: product._id } }] })
    res.render("shopit/show",{ product, similarProducts, msg: req.flash("success")})
})


