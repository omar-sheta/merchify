# Clean Architecture - Visual Overview

## Layer Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│  ┌──────────────────────┐         ┌─────────────────────────┐  │
│  │   Frontend (React)   │         │  API Routes (Next.js)   │  │
│  │                      │         │                         │  │
│  │  - Components        │         │  - upload-mux.js        │  │
│  │  - Pages             │◄────────┤  - generate-image.js    │  │
│  │  - API Clients       │         │  - shopify-query.js     │  │
│  │  - Storage Service   │         │  - create-order.js      │  │
│  └──────────────────────┘         └─────────────────────────┘  │
└──────────────────┬──────────────────────────┬───────────────────┘
                   │                          │
                   │                          ▼
                   │         ┌────────────────────────────────────┐
                   │         │    APPLICATION LAYER (Use Cases)   │
                   │         │                                    │
                   │         │  - UploadVideoUseCase             │
                   │         │  - GenerateImageUseCase           │
                   │         │  - ExecuteShopifyQueryUseCase     │
                   │         │  - CreateOrderUseCase             │
                   │         └──────────────┬─────────────────────┘
                   │                        │
                   │                        ▼
                   │         ┌────────────────────────────────────┐
                   │         │      DOMAIN LAYER (Core)           │
                   │         │                                    │
                   │         │  Entities:                         │
                   │         │  - Product                         │
                   │         │  - Order                           │
                   └────────►│  - VideoAsset                      │
                             │  - GeneratedImage                  │
                             │                                    │
                             │  Repository Interfaces:            │
                             │  - IVideoRepository                │
                             │  - IImageGenerationRepository      │
                             │  - IShopifyRepository              │
                             └──────────────┬─────────────────────┘
                                            │
                                            ▼
                             ┌────────────────────────────────────┐
                             │   INFRASTRUCTURE LAYER             │
                             │                                    │
                             │  Repository Implementations:       │
                             │  - MuxVideoRepository              │
                             │  - GeminiImageRepository           │
                             │  - ShopifyStorefrontRepository     │
                             │                                    │
                             │  Dependency Injection:             │
                             │  - DependencyContainer             │
                             └──────────────┬─────────────────────┘
                                            │
                                            ▼
                             ┌────────────────────────────────────┐
                             │       EXTERNAL SERVICES            │
                             │                                    │
                             │  - Mux Video API                   │
                             │  - Google Gemini API               │
                             │  - Shopify Storefront API          │
                             └────────────────────────────────────┘
```

## Request Flow Example: Upload Video

```
1. User clicks "Upload" button
         │
         ▼
2. UploadForm component
         │
         ▼
3. VideoApiClient.uploadVideo(file)
         │
         ▼
4. POST /api/upload-mux
         │
         ▼
5. API Route Handler
         │
         ▼
6. getContainer().getUseCase('uploadVideo')
         │
         ▼
7. UploadVideoUseCase.execute(file)
         │
         ▼
8. MuxVideoRepository.uploadVideo(file)
         │
         ▼
9. Mux API (External Service)
         │
         ▼
10. Returns VideoAsset entity
         │
         ▼
11. API Route returns JSON
         │
         ▼
12. VideoApiClient returns data
         │
         ▼
13. Component updates UI
```

## Dependency Flow (Clean Architecture Rule)

```
Presentation Layer
    │
    │ depends on
    ▼
Application Layer (Use Cases)
    │
    │ depends on
    ▼
Domain Layer (Entities & Interfaces)
    ▲
    │ implements
    │
Infrastructure Layer (Implementations)
    │
    │ depends on
    ▼
External Services
```

**Key Rule:** Dependencies always point inward!
- Infrastructure implements Domain interfaces
- Application uses Domain interfaces (not implementations)
- Presentation uses Application (use cases)

## Module Organization

```
backend/
├── domain/                    # Core business logic (no dependencies)
│   ├── entities/             # Business objects
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── VideoAsset.js
│   │   └── GeneratedImage.js
│   └── repositories/         # Interfaces (ports)
│       ├── IVideoRepository.js
│       ├── IImageGenerationRepository.js
│       └── IShopifyRepository.js
│
├── application/              # Business rules and use cases
│   └── use-cases/
│       ├── UploadVideoUseCase.js
│       ├── GenerateImageUseCase.js
│       ├── ExecuteShopifyQueryUseCase.js
│       └── CreateOrderUseCase.js
│
└── infrastructure/           # External concerns
    ├── repositories/        # Adapters implementing ports
    │   ├── MuxVideoRepository.js
    │   ├── GeminiImageRepository.js
    │   └── ShopifyStorefrontRepository.js
    └── di/                  # Dependency injection
        └── container.js

frontend/
├── services/
│   ├── api/                 # API communication
│   │   ├── VideoApiClient.js
│   │   ├── ImageApiClient.js
│   │   ├── ShopifyApiClient.js
│   │   └── OrderApiClient.js
│   └── StorageService.js    # Browser storage
└── models/
    └── ProductCatalog.js    # Business models
```

## Communication Patterns

### Backend Pattern (Hexagonal Architecture)

```
API Route → Use Case → Repository Interface ← Repository Implementation → External API
(Controller)  (Core)      (Port)                    (Adapter)
```

### Frontend Pattern (Service Layer)

```
Component → API Client → API Route → Backend
(View)      (Service)    (Controller) (Business Logic)
```

## Testing Strategy

```
┌──────────────────┐
│  Unit Tests      │  Test entities, use cases in isolation
└──────────────────┘
         │
         ▼
┌──────────────────┐
│ Integration Tests│  Test repositories with mocked APIs
└──────────────────┘
         │
         ▼
┌──────────────────┐
│    E2E Tests     │  Test complete user flows
└──────────────────┘
```

## Key Benefits Summary

1. **Separation of Concerns**
   - Each layer has one responsibility
   - Changes in one layer don't affect others

2. **Testability**
   - Easy to mock dependencies
   - Test business logic without external services

3. **Flexibility**
   - Swap implementations easily
   - Add new features without breaking existing code

4. **Maintainability**
   - Clear structure
   - Easy to understand and navigate

5. **Scalability**
   - Well-organized for growth
   - Team members can work independently
