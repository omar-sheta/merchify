# Migration Guide - Clean Architecture Refactor

## What Changed?

The Merchify application has been refactored from a monolithic structure to a **Clean Architecture** pattern with clear separation between backend and frontend concerns.

## Directory Structure Changes

### Before
```
merchify/
├── components/          # React components
├── lib/                 # Mixed utilities and API clients
├── pages/
│   ├── api/            # API routes
│   └── *.js            # Next.js pages
└── public/             # Static assets
```

### After
```
merchify/
├── backend/
│   ├── domain/              # ✨ NEW: Business entities and interfaces
│   ├── application/         # ✨ NEW: Use cases (business logic)
│   └── infrastructure/      # ✨ NEW: External service implementations
├── frontend/
│   ├── components/          # ✅ MOVED: React components (from root)
│   ├── services/            # ✨ NEW: API clients and services
│   └── models/              # ✨ NEW: Frontend data models
├── lib/                     # ⚠️ DEPRECATED: Use backend/ or frontend/
├── pages/
│   ├── api/                 # ✅ UPDATED: Now use dependency injection
│   └── *.js                 # ✅ UPDATED: Now use frontend services
└── public/                  # Static assets
```

## Code Changes

### API Routes (Backend Controllers)

#### Before
```javascript
// pages/api/upload-mux.js
export default async function handler(req, res) {
  // Direct implementation
  const mock = {
    assetId: 'mock-asset-123',
    playbackId: 'mock-playback-456',
    thumbnail: 'https://via.placeholder.com/512x288.png'
  }
  return res.status(200).json(mock)
}
```

#### After
```javascript
// pages/api/upload-mux.js
import { getContainer } from '../../backend/infrastructure/di/container'

export default async function handler(req, res) {
  try {
    const container = getContainer()
    const uploadVideoUseCase = container.getUseCase('uploadVideo')
    
    const videoAsset = await uploadVideoUseCase.execute(file)
    
    return res.status(200).json({
      assetId: videoAsset.assetId,
      playbackId: videoAsset.playbackId,
      thumbnail: videoAsset.thumbnail
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
```

### Frontend Components

#### Before
```javascript
// components/UploadForm.js
import { useState } from 'react'

export default function UploadForm() {
  async function handleUpload(e) {
    const fd = new FormData()
    fd.append('file', file)
    
    const res = await fetch('/api/upload-mux', {
      method: 'POST',
      body: fd,
    })
    const data = await res.json()
  }
}
```

#### After
```javascript
// components/UploadForm.js
import { useState } from 'react'
import VideoApiClient from '../services/api/VideoApiClient'

export default function UploadForm() {
  async function handleUpload(e) {
    try {
      const data = await VideoApiClient.uploadVideo(file)
      // Handle success
    } catch (err) {
      // Handle error
    }
  }
}
```

### Frontend Pages

#### Before
```javascript
// pages/customize.js
const products = [
  { id: 'tshirt', name: 'T-Shirt', price: 24.99 },
  // ...
]

function proceedToCheckout() {
  sessionStorage.setItem('orderData', JSON.stringify(orderData))
  router.push('/checkout')
}
```

#### After
```javascript
// pages/customize.js
import StorageService from '../frontend/services/StorageService'
import { PRODUCTS, calculateOrderTotal } from '../frontend/models/ProductCatalog'

function proceedToCheckout() {
  StorageService.saveOrderData(orderData)
  router.push('/checkout')
}
```

## New Features

### 1. Dependency Injection Container

All dependencies are managed through a centralized container:

```javascript
const { getContainer } = require('./backend/infrastructure/di/container')

const container = getContainer()
const useCase = container.getUseCase('uploadVideo')
const repository = container.getRepository('videoRepository')
```

### 2. Use Cases (Business Logic)

Business logic is now encapsulated in use cases:

```javascript
const UploadVideoUseCase = require('./backend/application/use-cases/UploadVideoUseCase')

const useCase = new UploadVideoUseCase(videoRepository)
const result = await useCase.execute(file)
```

### 3. Repository Pattern

External services are accessed through repository interfaces:

```javascript
// Interface (Port)
class IVideoRepository {
  async uploadVideo(file) { throw new Error('Not implemented') }
}

// Implementation (Adapter)
class MuxVideoRepository extends IVideoRepository {
  async uploadVideo(file) {
    // Actual Mux implementation
  }
}
```

### 4. API Clients (Frontend)

Frontend now uses dedicated API clients:

```javascript
import VideoApiClient from '../frontend/services/api/VideoApiClient'

const result = await VideoApiClient.uploadVideo(file)
```

### 5. Storage Service

Browser storage is managed through a service:

```javascript
import StorageService from '../frontend/services/StorageService'

StorageService.saveCapturedFrame(imageUrl)
const frame = StorageService.getCapturedFrame()
```

## Breaking Changes

### ⚠️ Old `lib/` Directory

The old `lib/` directory files are **deprecated** but kept for backwards compatibility. They now delegate to the new architecture:

- `lib/gemini.js` → `backend/infrastructure/repositories/GeminiImageRepository.js`
- `lib/mux.js` → `backend/infrastructure/repositories/MuxVideoRepository.js`
- `lib/shopify.js` → `backend/infrastructure/repositories/ShopifyStorefrontRepository.js`

**Action Required:** Update any code still using `lib/` to use the new structure.

### ⚠️ Direct sessionStorage Access

Direct `sessionStorage` access should be replaced with `StorageService`:

```javascript
// ❌ Old way
sessionStorage.setItem('capturedFrame', imageUrl)
const frame = sessionStorage.getItem('capturedFrame')

// ✅ New way
import StorageService from '../frontend/services/StorageService'
StorageService.saveCapturedFrame(imageUrl)
const frame = StorageService.getCapturedFrame()
```

## Migration Checklist

- [x] Backend domain entities created
- [x] Backend use cases created
- [x] Infrastructure repositories created
- [x] Dependency injection container set up
- [x] API routes updated to use DI
- [x] Frontend API clients created
- [x] Frontend storage service created
- [x] Frontend models/catalog created
- [x] Components moved to frontend directory
- [x] Components updated to use new services
- [x] Pages updated to use new services
- [x] Old `lib/` files deprecated with compatibility layer
- [ ] Update tests to use new architecture
- [ ] Update documentation

## Benefits

1. **Testability** - Easy to mock dependencies and test in isolation
2. **Maintainability** - Clear separation of concerns
3. **Flexibility** - Easy to swap implementations
4. **Scalability** - Clean structure for growth
5. **Type Safety** - Better IDE support and error detection

## Next Steps

1. Write unit tests for use cases
2. Write integration tests for repositories
3. Add TypeScript for better type safety
4. Create custom React hooks for common operations
5. Add state management (React Context or Redux) if needed

## Questions?

Refer to `ARCHITECTURE.md` for detailed documentation on the clean architecture implementation.
