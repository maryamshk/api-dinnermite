const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes")
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middleware/authMiddleware");
const connectDb = require("./config/dbConnection");
const { notFound, errHandler } = require('./middleware/errorMiddleware.js');
const bodyParser = require("body-parser");
const orderRoutes = require('./routes/orderRoutes');


app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());


const port = process.env.Port || 5000;

connectDb();


app.get("*", checkUser);
app.use('/auth', authRoutes);
app.use('/order', orderRoutes);
app.use('/products', productRoutes);


app.use(notFound);
app.use(errHandler);


app.listen(port, () => {
    console.log("listening");
});

