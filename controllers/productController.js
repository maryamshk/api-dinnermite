const Product = require("../models/productSchema");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const ApiFeatures = require("../utils/apiFeatures");

// get all products
module.exports.getProducts = asyncHandler(async (req, res) => {
    const ApiFeature = new ApiFeatures(Product.find(), req.query).search();
    // const products = await Product.find({});
    const products = await ApiFeature.query;

    if (products) {
        res.status(201).json(products);
    } else {
        res.status(404);
        throw new Error("There is no product");
    }
});


// get product by id
module.exports.getProductsById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.status(201).json(product);
    } else {
        throw new Error("invalid product");
    }
});


// // create product
module.exports.addProduct = async (req, res) => {
    try {
        const { title, category, subCategories, inStock, thumbnail } = req.body;
        if (!title || !category || !subCategories || !inStock || !thumbnail) {
            return res.status(400).json({ error: "Missing required credentials" });
        }
        const product = await Product.create({
            title,
            category,
            subCategories,
            inStock,
            thumbnail,

        });
        res.status(201).json({ msg: "Product created successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
};



// update product
module.exports.updateProduct = asyncHandler(async (req, res) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error("product not found");
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        product,
    });
});



// delete product
module.exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error("product not found");

    };

    await product.deleteOne();
    res.status(200).json({
        success: true,
        message: "product deleted",
    });
});


// // saving images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
        // err, destination
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + file.originalname);
    },
});

module.exports.upload = multer({ storage: storage });

module.exports.placeOrderImg = async (req, res) => {
    console.log(req.body);
    const imgName = req.file.filename;
    try {
        await Product.create({
            image: imgName,
        });
        res.status(200).json({ status: "ok" });
    } catch (err) {
        res.status(400).json({ status: err });
    }
};