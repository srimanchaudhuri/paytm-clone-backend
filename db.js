require('dotenv').config();


const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URL)


const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    password: String
})

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})

const User = mongoose.model('User', userSchema)
const Account = mongoose.model('Account', accountSchema)


module.exports = {
    User,
    Account
}