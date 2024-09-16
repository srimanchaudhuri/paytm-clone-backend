const express = require('express')

const {authMiddleware} = require('../middleware')
const { Account } = require('../db')
const  {default: mongoose} = require('mongoose')

const router = express.Router()
router.get('/balance',authMiddleware, async (req, res) => {
    const userId = req.userId
    const account = await Account.findOne({
        userId: userId
    })
    if(!account) {
        return res.status(404)
    }
    res.status(200).json({
        balance: account.balance
    })
})

router.post('/transfer', authMiddleware, async (req, res) => {

    const session = await mongoose.startSession()

    session.startTransaction()
    const {to, amount} = req.body
    const toAccount = await Account.findOne({userId: to})
    console.log(toAccount);
    const fromAccount = await Account.findOne({userId: req.userId})
    console.log(fromAccount);
    if(!toAccount) {
        return res.status(400).json({
            message: 'Invalid Account'
        })
    }

    if (fromAccount.balance < amount) {
        return res.status(400).json({
            message: "Insufficient Balance"
        })
    }


    await Account.updateOne({
        userId: req.userId
    }, {
        $inc: {
            balance: -amount
        }
    })

    await Account.updateOne({
        userId: to
    }, {
        $inc: {
            balance: amount
        }
    })

    await session.commitTransaction()
    res.json({
        message: "Transfer Successful"
    })
})

module.exports = router