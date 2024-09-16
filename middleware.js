const { JWT_SECRET } = require('./config')
const jwt = require('jsonwebtoken')
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization

    if(!token || !token.startsWith('Bearer ')) {
        return res.status(403).json({mess: `not Found 1 ${token}`})
    }
    const jwtToken = token.split(' ')[1]
    
    try{
        const decoded = jwt.verify(jwtToken, JWT_SECRET)

        req.userId = decoded.userId

        next()
    } catch(err) {
        return res.status(403)
    }
}

module.exports = {
    authMiddleware
}