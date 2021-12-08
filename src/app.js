const express = require("express")
require("./db/mongoose")
const userRouter = require("./routers/user")
const taskRouter = require("./routers/tasks")

const app = express()
const port = process.env.PORT

// auto-parse incoming json to an object
app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => console.log("Server is up on port " + port))