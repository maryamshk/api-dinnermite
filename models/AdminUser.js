const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please Enter Your Name'],
            maxLength: [30, 'Name cannot exceed 30 characters'],
        },

        email: {
            type: String,
            required: [true, 'Please enter an email'],
            unique: true,
            lowercase: true,
            validate: [isEmail, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Please enter a password'],
            minlength: [6, 'Minimum password length is 6 characters'],
        },

        profilePic: {
            type: String,
            default: '',
        },

        address: {
            type: String,
            default: '',
        },

        isAdmin: {
            type: Boolean,
            default: false,
        },

        role: {
            type: String,
            default: 'user',
        }
    },
    { timestamps: true }
);

adminSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

adminSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);

        if (auth) {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
};

const AdminUsers = mongoose.model('AdminUsers', adminSchema);

module.exports = AdminUsers;
