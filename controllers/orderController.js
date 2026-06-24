const Order = require('../models/Order')
const Product = require('../models/Product')

// Create new order


const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice } = req.body

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' })
    }

    // Check stock availability first
    for (const item of orderItems) {
      const product = await Product.findById(item.product)
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${item.name}. Only ${product.stock} left.` })
      }
    }

    // Create the order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      totalPrice,
    })

    const createdOrder = await order.save()

    // Decrease stock for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      })
    }

    res.status(201).json(createdOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get logged in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get ALL orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const newStatus = req.body.status

    // If cancelling an order that wasn't already cancelled, restore stock
    if (newStatus === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        })
      }
    }

    order.status = newStatus
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus }