const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        // type of data stored is an objectID
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // create relationships with User model
        ref: 'User'
    }
}, {
    timestamps: true
})


const Task = mongoose.model("Task", taskSchema)

module.exports = Task