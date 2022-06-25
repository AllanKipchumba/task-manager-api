const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("../models/tasks");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        // trim spaces
        trim: true,
    },

    email: {
        type: String,
        // make sure an email is not reused to create an account with unique set to true
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email");
            }
        },
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error("Password can not contain 'password'");
            }
        },
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error("Age must be a positive number");
            }
        },
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        },
    }, ],
    avatar: {
        type: Buffer,
    },
}, {
    // adding timestamp fields >>created at
    timestamps: true,
});

// create relationships with the Task model
// not stored in db
userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner",
});

// hide private data
userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

// methods, unlike statics, allows you to perform some action on a specific instance >> specific user
// targets user
// generate auth tokens for each user
userSchema.methods.generateAuthTokens = async function() {
    const user = this;
    // create token
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    // save token to db
    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};

// statics allows you to define your own fns that directly exists with the model
// targets User
// checks if email exists and password for thaat email matches
userSchema.statics.findByCredentials = async(email, password) => {
    // email: email >> destructerd to {email}
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Unable to login");
    }

    return user;
};

// PRE IS A MIDDLEWARE FN. IT ALLOWS YOU TO RUN SOME CODE BEFORE OR
// AFTER A LIFECYCLE EVENT FOR YOUR MODEL

// hash the plain text password before saving
userSchema.pre("save", async function(next) {
    const user = this;
    // when creating/updating password
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    // makes sure to run next() to save the user
    next();
});

// delete user tasks when user is removed
userSchema.pre("remove", async function(next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });

    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;