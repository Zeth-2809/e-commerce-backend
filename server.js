const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
const productRoutes = require('./routes/productRoutes')
app.use('/api/products', productRoutes)

app.get('/', (req, res) => {
  res.send('E-Commerce API is running!')
})

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected!')
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    })
  })
  .catch((err) => {
    console.log('❌ MongoDB Connection Error:', err)
  })