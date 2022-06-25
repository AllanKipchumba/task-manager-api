const request = require("supertest")
const app = require("../src/index")
const User = require("../src/models/user")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const { response } = require("../src/index")

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    name: "allan",
    email: "allankipchumba76@gmail.com",
    password: "123456!7",
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

beforeEach(async() => {
    await User.deleteMany()
    await new User(userOne).save()
})

test("should sign up a new user", async() => {
    await request(app).post("/users").send({
        name: "allan",
        email: "allankipchumba76@gmail.com",
        password: "123456!7"
    }).expect(201)

    // assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assetions about the response
    expect(response.body).toMatchObject({
        user: {
            name: "allan",
            email: "allankipchumba76@gmail.com"
        },
        token: user.tokens[0].token
    })

    // assert that the password is hashed
    expect(user.password).not.toBe("1234567!")
})


test("should login existing user", async() => {
    await request(app).post("/users/login").send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
})

test("should not login non-existent user", async() => {
    await request(app).post("/users/login").send({
        email: userOne.email,
        password: "!this is my pass word"
    }).expect(400)
})

test("should get profile for user", async() => {
    await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test("should not get profile for unauthenticated user", async() => {
    await request(app)
        .get("/users/me")
        .send()
        .expect(401)
})

test("should delete account for user", async() => {
    await request(app)
        .delete("/users/me")
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = User.findById(userOneId)
    expect(user).toBeNull()
})

test("should not delete account for unauthorised user", async() => {
    await request(app)
        .delete("/users/me")
        .send()
        .expect(401)
})

test("should upload avatar image", async() => {
    await request(app)
        .post("/users/me/avatar")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .attach("avatar", "tests/fixtures/profile-pic.jpeg")
        // .set('Connection', 'keep-alive')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test("Should updte valid user fields", async() => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer $${userOne.tokens[0].token}`)
        .send({
            name: "jess"
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toequal("jess")
})

test("Should not updte invalid user fields", async() => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer $${userOne.tokens[0].token}`)
        .send({
            location: "nairobi"
        })
        .expect(400)
})