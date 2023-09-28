const User = require("../models/User");
const jwt = require("jsonwebtoken");

// handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: "", password: "" };

    // incorrect email
    if (err.message === "incorrect email") {
        errors.email = "That email is not registered";
    }

    // incorrect password
    if (err.message === "incorrect password") {
        errors.password = "That password is incorrect";
    }

    // duplicate email error
    if (err.code === 11000) {
        errors.email = "that email is already registered";
        return errors;
    }

    // validation errors
    if (err.message.includes("user validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
};


// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: maxAge,
    });
};

// get registered users
module.exports.getAllUsers = async (req, res) => {
    try {
        const user = await User.find({}).select('isAdmin _id name email address');
        if (user) {
            res.status(200).send(user);
        } else {
            res.status(400).json({ message: "user not found" });
        }
    } catch (err) {
        res.status(400).json({ message: "internal server error" });
    }
};

module.exports.register_post = async (req, res) => {
    const { name, email, password, address, profilePic } = req.body;

    try {
        const user = await User.create({
            name,
            email,
            password,
            address,
            profilePic,
        });

        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({
            isAdmin: user.isAdmin,
            _id: user._id,
            name: user.name,
            email: user.email,
            address: user.address
        });
    } catch (err) {
        const errors = handleErrors(err);
        const errorsText = Object.values(errors).join("");
        res.status(400).send(errorsText);
    }
};


module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "email and password are required" });
        }
        const user = await User.login(email, password);
        if (!user) {
            return res.status(400).json({ errors: "User not found" });
        }
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({
            token,
            isAdmin: user.isAdmin,
            _id: user._id,
            name: user.name,
            email: user.email,
            address: user.address
        });
    } catch (err) {
        const errors = handleErrors(err);
        const errorsText = Object.values(errors).join("");
        res.status(400).send(errorsText);
    }
};


module.exports.logout_get = (req, res) => {
    const user = User.findById(req.params.id);
    if (user) {
        res.status(200);
        res.cookie("jwt", "", { maxAge: 1 });
        res.json({ message: "user logged out" });
    } else {
        res.status(400).json({ message: "user not found" });
    }
};

// update user
module.exports.updateUser = async (req, res) => {
    let user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error("user not found");
    }

    const { email, password } = req.body;
    let obj;
    // obj.name = name;
    obj.email = email;
    obj.password = password;




    user = await User.findByIdAndUpdate(req.params.id, obj, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        user,
    });
};

