# Merchify - Clean Architecture

## Overview

This project has been refactored using **Clean Architecture** principles to ensure separation of concerns, maintainability, and testability.

## Architecture Layers

### 1. Domain Layer (`backend/domain/`)
The innermost layer containing business rules and entities.

#### Entities
- **Product** - Represents merchandise products
- **Order** - Represents customer orders
- **VideoAsset** - Represents Mux video assets
- **GeneratedImage** - Represents AI-generated images

#### Repository Interfaces (Ports)
- **IVideoRepository** - Contract for video operations
- **IImageGenerationRepository** - Contract for AI image generation
- **IShopifyRepository** - Contract for e-commerce operations

### 2. Application Layer (`backend/application/`)
Contains business logic and use cases.

#### Use Cases
- **UploadVideoUseCase** - Handles video upload logic
- **GenerateImageUseCase** - Handles image generation logic
- **ExecuteShopifyQueryUseCase** - Handles Shopify query logic
- **CreateOrderUseCase** - Handles order creation logic

### 3. Infrastructure Layer (`backend/infrastructure/`)
Contains implementations of external services and frameworks.

#### Repository Implementations (Adapters)
- **MuxVideoRepository** - Mux video service adapter
- **GeminiImageRepository** - Google Gemini AI adapter
- **ShopifyStorefrontRepository** - Shopify Storefront API adapter

#### Dependency Injection
- **container.js** - Manages dependency injection for the application

### 4. Presentation Layer

#### Backend (`pages/api/`)
API routes acting as controllers:
- `upload-mux.js` - Video upload endpoint
- `generate-image.js` - Image generation endpoint
- `shopify-query.js` - Shopify query endpoint
- `create-order.js` - Order creation endpoint

#### Frontend (`frontend/`)
Client-side architecture:

**Components:** (`frontend/components/`)
- UI components for the application

**Services:**
- **VideoApiClient** - Handles video API requests
- **ImageApiClient** - Handles image generation API requests
- **ShopifyApiClient** - Handles Shopify API requests
- **OrderApiClient** - Handles order API requests
- **StorageService** - Manages browser storage

**Models:**
- **ProductCatalog** - Product data and business logic

**Pages:** (`pages/`)
- Next.js pages for routing

## Data Flow

```
┌─────────────────┐
│  User Interface │
│   (React Pages) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Clients    │
│  (Frontend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Routes     │
│  (Controllers)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Use Cases     │
│  (Application)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Repositories   │
│(Infrastructure) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ External APIs   │
│(Mux, Gemini, etc)│
└─────────────────┘
```

## Benefits of This Architecture

1. **Separation of Concerns** - Each layer has a specific responsibility
2. **Testability** - Easy to mock dependencies and test in isolation
3. **Maintainability** - Changes in one layer don't affect others
4. **Flexibility** - Easy to swap implementations (e.g., change from Mux to another video service)
5. **Scalability** - Clear structure for adding new features

## Dependency Rule

Dependencies only point inward:
- **Presentation** depends on **Application**
- **Application** depends on **Domain**
- **Infrastructure** depends on **Domain**
- **Domain** depends on nothing

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env.local` file:

```env
# Mux Configuration
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret

# Shopify Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=your_storefront_token

# Gemini Configuration (coming soon)
GEMINI_API_KEY=your_gemini_api_key
```

## Adding New Features

### Adding a New Use Case

1. Create entity in `backend/domain/entities/`
2. Create repository interface in `backend/domain/repositories/`
3. Create use case in `backend/application/use-cases/`
4. Create repository implementation in `backend/infrastructure/repositories/`
5. Register in `backend/infrastructure/di/container.js`
6. Create API route in `pages/api/`
7. Create API client in `frontend/services/api/`
8. Use in components

### Example: Adding Product Reviews

```javascript
// 1. Entity
class Review {
  constructor({ id, productId, rating, comment }) {
    this.id = id
    this.productId = productId
    this.rating = rating
    this.comment = comment
  }
}

// 2. Repository Interface
class IReviewRepository {
  async createReview(review) {}
  async getReviews(productId) {}
}

// 3. Use Case
class CreateReviewUseCase {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository
  }
  
  async execute(reviewData) {
    const review = new Review(reviewData)
    return await this.reviewRepository.createReview(review)
  }
}

// 4. Implementation
class ShopifyReviewRepository extends IReviewRepository {
  async createReview(review) {
    // Implementation using Shopify API
  }
}

// 5. Register in container
this.useCases.createReview = new CreateReviewUseCase(
  this.repositories.reviewRepository
)

// 6. API Route
export default async function handler(req, res) {
  const container = getContainer()
  const useCase = container.getUseCase('createReview')
  const review = await useCase.execute(req.body)
  res.json(review)
}

// 7. API Client
class ReviewApiClient {
  async createReview(data) {
    return fetch('/api/create-review', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// 8. Use in component
const review = await ReviewApiClient.createReview(reviewData)
```

## Testing Strategy

### Unit Tests
- Test entities in isolation
- Test use cases with mocked repositories
- Test repository implementations with mocked external APIs

### Integration Tests
- Test API routes with mocked use cases
- Test frontend components with mocked API clients

### E2E Tests
- Test complete user flows

## Project Structure

```
merchify/
├── backend/
│   ├── domain/
│   │   ├── entities/          # Business entities
│   │   └── repositories/      # Repository interfaces (ports)
│   ├── application/
│   │   └── use-cases/         # Business logic
│   └── infrastructure/
│       ├── repositories/      # Repository implementations (adapters)
│       └── di/                # Dependency injection
├── frontend/
│   ├── components/            # React components
│   ├── services/
│   │   └── api/               # API clients
│   ├── models/                # Frontend data models
│   └── hooks/                 # Custom React hooks (future)
├── pages/
│   ├── api/                   # API routes (controllers)
│   └── *.js                   # Next.js pages
└── public/                    # Static assets
```

## Naming Conventions

- **Entities**: PascalCase (e.g., `Product`, `Order`)
- **Use Cases**: PascalCase ending with `UseCase` (e.g., `CreateOrderUseCase`)
- **Repositories**: PascalCase with prefix/suffix indicating implementation (e.g., `MuxVideoRepository`)
- **API Clients**: PascalCase ending with `ApiClient` (e.g., `VideoApiClient`)
- **Services**: PascalCase ending with `Service` (e.g., `StorageService`)

## Contributing

When contributing, please follow the clean architecture principles:

1. Keep domain layer pure (no external dependencies)
2. Use dependency injection
3. Follow the dependency rule
4. Write tests for each layer
5. Document new features

## License

[Your License Here]
