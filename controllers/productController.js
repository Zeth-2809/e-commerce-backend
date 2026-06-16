const Product = require('../models/Product')

// Get all products
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query

    let query = {}

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // Sort
    let sortOption = {}
    if (sort === 'price-low') sortOption = { price: 1 }
    else if (sort === 'price-high') sortOption = { price: -1 }
    else if (sort === 'newest') sortOption = { createdAt: -1 }
    else sortOption = { createdAt: -1 }

    const products = await Product.find(query).sort(sortOption)
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create product
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body)
    const savedProduct = await product.save()
    res.status(201).json(savedProduct)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(product)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete product
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct }