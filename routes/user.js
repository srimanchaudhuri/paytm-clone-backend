const express = require('express')
const { User, Account } = require('../db')
const jwt = require('jsonwebtoken')
const {authMiddleware} = require('../middleware')
const { JWT_SECRET } = require('../config')
const zod = require('zod')

const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

const updateBody = zod.object({
    username: zod.string().email().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

const router = express.Router()

router.post('/signup', async (req, res) => {
    const {success} = signupBody.safeParse(req.body)
    if(!success) {
        return res.status(411).json({
            message: 'Incorrect Inputs'
        })
    }
    const {username, firstName, lastName, password} = req.body
    const existingUser = await User.findOne({username: username})
    if(existingUser) {
        return res.status(411).json({ message : 'User already exists' })
    }

    const user = await User.create({
        username,
        firstName,
        lastName,
        password
    })
    const userId = user._id
    const token = jwt.sign({
        userId:userId
    }, JWT_SECRET)

    await Account.create({
        userId,
        balance: Math.ceil(((Math.random()*10000) + 1))
    })


    res.status(200).json({
        message: "User created successfully",
        token: token
    })
})

router.post('/signin', async(req, res) => {
    const { success } = signinBody.safeParse(req.body)

    if(!success) {
        return res.status(411).json({
            message: 'Incorrect Inputs'
        })
    }
    const {username, password} = req.body
    const user = await User.findOne({username, password})
    if(!user) {
        return res.status(411).json({ message : 'User does not exists' })
    }
    const userId = user._id
    const token = jwt.sign({userId}, JWT_SECRET)
    res.status(200).json({
        token: token
    })
})

router.put('/', authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if(!success) {
        return res.status(411).json({message: "Invalid Inputs"})
    }
    
    await User.updateOne( {
        _id: req.userId
    }, req.body)

    res.json({
        message: 'Updated user successfully'
    })
})

router.get('/bulk', async(req, res) => {
    const filter = req.query.filter || ""
    console.log(filter);

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})
module.exports = router