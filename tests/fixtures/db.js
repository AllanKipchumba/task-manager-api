const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    name: "allan",
    email: "allankipchumba76@gmail.com",
    password: "123456!7",
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const setupDatabase = async () => {
    
}