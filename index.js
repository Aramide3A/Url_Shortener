const express = require('express')
const app = express()
const url = require('./routes/url.routes')


app.use(express.json())

app.use('/api', url)

app.listen(3000, ()=>{
    console.log("app running on 3000")
})