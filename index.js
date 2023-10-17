const express = require("express")
require("dotenv").config()
const cors = require("cors")
const app = express()
const {mongoose} = require('mongoose')
const cookieParser = require("cookie-parser")


// Databse connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Database connected'))
    .catch((error) => console.log('Database not connected', error))


app.use(cors({origin:["http://localhost:5173","mywebsite.com"], credentials: true}))

// middleware for cookie parser
app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/', require('./routes/authRoutes'))

const PORT = 8000
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))