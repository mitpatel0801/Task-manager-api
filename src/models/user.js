const validator = require('validator');
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Task = require('./task');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error("Please enter valide age");
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Enter valide E-mail");
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlenghth: 7,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error("Please enter correct passoword.");
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar: {

    }

}, {
    timestamps: true,
});

userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
})

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.avatar;
    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.statics.findByCredentials = async(email, password) => {

    const userData = await User.findOne({ email });
    if (!userData) {
        throw new Error("Unable to login");
    }
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
        throw new Error("Unable to login");
    }

    return userData;
}



userSchema.pre("save", async function(next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

userSchema.pre("remove", async function(next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
})

const User = mongoose.model("User", userSchema);



module.exports = User;