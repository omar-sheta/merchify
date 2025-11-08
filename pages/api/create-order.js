// API endpoint for creating orders
import { getContainer } from '../../backend/infrastructure/di/container'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { capturedFrame, product, color, size, quantity, totalPrice } = req.body || {}

  if (!capturedFrame || !product || !color || !size || !quantity) {
    return res.status(400).json({ error: 'Missing required order data' })
  }

  try {
    const container = getContainer()
    const createOrderUseCase = container.getUseCase('createOrder')

    const order = await createOrderUseCase.execute({
      capturedFrame,
      product,
      color,
      size,
      quantity,
      totalPrice
    })

    return res.status(200).json({
      orderId: order.id,
      status: order.status,
      checkoutUrl: order.checkoutUrl,
      createdAt: order.createdAt
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return res.status(500).json({ 
      error: error.message || 'Order creation failed' 
    })
  }
}
