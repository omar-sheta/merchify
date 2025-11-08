// Domain Entities
const Product = require('./entities/Product')
const Order = require('./entities/Order')
const VideoAsset = require('./entities/VideoAsset')
const GeneratedImage = require('./entities/GeneratedImage')

// Repository Interfaces
const IVideoRepository = require('./repositories/IVideoRepository')
const IImageGenerationRepository = require('./repositories/IImageGenerationRepository')
const IShopifyRepository = require('./repositories/IShopifyRepository')

module.exports = {
  // Entities
  Product,
  Order,
  VideoAsset,
  GeneratedImage,
  
  // Repositories
  IVideoRepository,
  IImageGenerationRepository,
  IShopifyRepository,
}
