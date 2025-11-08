// Infrastructure
const MuxVideoRepository = require('../infrastructure/repositories/MuxVideoRepository')
const GeminiImageRepository = require('../infrastructure/repositories/GeminiImageRepository')
const ShopifyStorefrontRepository = require('../infrastructure/repositories/ShopifyStorefrontRepository')

// Use Cases
const UploadVideoUseCase = require('../application/use-cases/UploadVideoUseCase')
const GenerateImageUseCase = require('../application/use-cases/GenerateImageUseCase')
const ExecuteShopifyQueryUseCase = require('../application/use-cases/ExecuteShopifyQueryUseCase')
const CreateOrderUseCase = require('../application/use-cases/CreateOrderUseCase')

/**
 * DependencyContainer
 * Manages dependency injection for the application
 */
class DependencyContainer {
  constructor() {
    this.repositories = {}
    this.useCases = {}
    this.initializeRepositories()
    this.initializeUseCases()
  }

  initializeRepositories() {
    this.repositories.videoRepository = new MuxVideoRepository()
    this.repositories.imageRepository = new GeminiImageRepository()
    this.repositories.shopifyRepository = new ShopifyStorefrontRepository()
  }

  initializeUseCases() {
    this.useCases.uploadVideo = new UploadVideoUseCase(
      this.repositories.videoRepository
    )
    this.useCases.generateImage = new GenerateImageUseCase(
      this.repositories.imageRepository
    )
    this.useCases.executeShopifyQuery = new ExecuteShopifyQueryUseCase(
      this.repositories.shopifyRepository
    )
    this.useCases.createOrder = new CreateOrderUseCase(
      this.repositories.shopifyRepository
    )
  }

  getUseCase(name) {
    if (!this.useCases[name]) {
      throw new Error(`Use case ${name} not found`)
    }
    return this.useCases[name]
  }

  getRepository(name) {
    if (!this.repositories[name]) {
      throw new Error(`Repository ${name} not found`)
    }
    return this.repositories[name]
  }
}

// Singleton instance
let instance = null

function getContainer() {
  if (!instance) {
    instance = new DependencyContainer()
  }
  return instance
}

module.exports = { DependencyContainer, getContainer }
