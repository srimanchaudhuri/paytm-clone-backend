const express = require('express')
const  rootRouter  = require("./routes/index");
const cors = require('cors')
const PORT = 3000

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/v1', rootRouter)

app.listen(PORT, (err) => {
    if(err)
    console.error(err)
    console.log("Listening on port ", PORT);
})