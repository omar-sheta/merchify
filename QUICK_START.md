# Quick Start Guide - Clean Architecture

## For Developers New to This Codebase

### 🎯 Quick Overview

This project uses **Clean Architecture** with clear separation between:
- **Backend** - Business logic and external services
- **Frontend** - UI and presentation logic

### 📁 Where to Find Things

```
Need to...                          → Look in...
─────────────────────────────────────────────────────────────────
Add business logic                  → backend/application/use-cases/
Create a new entity                 → backend/domain/entities/
Connect to external API             → backend/infrastructure/repositories/
Add a new API endpoint              → pages/api/
Create a UI component               → frontend/components/
Call an API from frontend           → frontend/services/api/
Define product data                 → frontend/models/
```

### 🚀 Common Tasks

#### 1. Adding a New API Endpoint

```javascript
// 1. Create use case (backend/application/use-cases/MyUseCase.js)
class MyUseCase {
  constructor(myRepository) {
    this.myRepository = myRepository
  }
  
  async execute(data) {
    // Your business logic here
    return await this.myRepository.doSomething(data)
  }
}

// 2. Register in container (backend/infrastructure/di/container.js)
this.useCases.myUseCase = new MyUseCase(
  this.repositories.myRepository
)

// 3. Create API route (pages/api/my-endpoint.js)
import { getContainer } from '../../backend/infrastructure/di/container'

export default async function handler(req, res) {
  try {
    const container = getContainer()
    const useCase = container.getUseCase('myUseCase')
    const result = await useCase.execute(req.body)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 4. Create API client (frontend/services/api/MyApiClient.js)
class MyApiClient {
  async doSomething(data) {
    const response = await fetch('/api/my-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return await response.json()
  }
}

export default new MyApiClient()

// 5. Use in component
import MyApiClient from '../services/api/MyApiClient'

const result = await MyApiClient.doSomething(data)
```

#### 2. Adding a New Entity

```javascript
// backend/domain/entities/MyEntity.js
class MyEntity {
  constructor({ id, name, value }) {
    this.id = id
    this.name = name
    this.value = value
    this.createdAt = new Date()
  }

  isValid() {
    return !!(this.id && this.name)
  }

  // Add business methods
  calculateSomething() {
    return this.value * 2
  }
}

module.exports = MyEntity
```

#### 3. Connecting to External API

```javascript
// 1. Define interface (backend/domain/repositories/IMyRepository.js)
class IMyRepository {
  async fetchData(id) {
    throw new Error('Method not implemented')
  }
}

// 2. Implement (backend/infrastructure/repositories/MyApiRepository.js)
class MyApiRepository extends IMyRepository {
  async fetchData(id) {
    const response = await fetch(`https://api.example.com/data/${id}`)
    return await response.json()
  }
}

// 3. Register in container (backend/infrastructure/di/container.js)
this.repositories.myRepository = new MyApiRepository()
```

#### 4. Calling API from Component

```javascript
import { useState } from 'react'
import MyApiClient from '../services/api/MyApiClient'

function MyComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchData() {
    setLoading(true)
    setError(null)
    
    try {
      const result = await MyApiClient.doSomething({ id: 123 })
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}
```

### 🧪 Testing Examples

#### Unit Test - Use Case
```javascript
// MyUseCase.test.js
describe('MyUseCase', () => {
  it('should process data correctly', async () => {
    // Mock repository
    const mockRepository = {
      doSomething: jest.fn().mockResolvedValue({ success: true })
    }
    
    // Create use case with mock
    const useCase = new MyUseCase(mockRepository)
    
    // Execute
    const result = await useCase.execute({ data: 'test' })
    
    // Assert
    expect(result.success).toBe(true)
    expect(mockRepository.doSomething).toHaveBeenCalledWith({ data: 'test' })
  })
})
```

#### Integration Test - API Route
```javascript
// api/my-endpoint.test.js
import handler from './my-endpoint'

describe('/api/my-endpoint', () => {
  it('should return success', async () => {
    const req = { method: 'POST', body: { data: 'test' } }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    
    await handler(req, res)
    
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true
    }))
  })
})
```

### 🔍 Debugging Tips

#### 1. API Not Working?
```javascript
// Add logging to use case
async execute(data) {
  console.log('UseCase input:', data)
  const result = await this.repository.doSomething(data)
  console.log('UseCase output:', result)
  return result
}
```

#### 2. Frontend Not Receiving Data?
```javascript
// Check API client
async doSomething(data) {
  console.log('API Client request:', data)
  const response = await fetch('/api/my-endpoint', { ... })
  console.log('API Client response status:', response.status)
  const result = await response.json()
  console.log('API Client response data:', result)
  return result
}
```

#### 3. Dependency Injection Issue?
```javascript
// Check container
const container = getContainer()
console.log('Available use cases:', Object.keys(container.useCases))
console.log('Available repositories:', Object.keys(container.repositories))
```

### 📚 Key Files to Understand

1. **backend/infrastructure/di/container.js**
   - All dependencies are registered here
   - Start here to understand the application structure

2. **backend/domain/entities/**
   - Core business objects
   - Understand what data you're working with

3. **backend/application/use-cases/**
   - Business logic lives here
   - Understand what operations are available

4. **pages/api/**
   - API endpoints
   - Understand how frontend communicates with backend

5. **frontend/services/api/**
   - API clients
   - Understand how to call APIs from components

### 🎨 Architecture Patterns Used

1. **Dependency Injection** - All dependencies injected through container
2. **Repository Pattern** - Abstract data access
3. **Use Case Pattern** - One operation = one use case
4. **Service Layer** - Frontend services for API communication
5. **Entity Pattern** - Business objects with behavior

### 💡 Best Practices

1. **Always use the container** - Don't instantiate use cases directly
2. **Keep entities pure** - No external dependencies in entities
3. **One use case = one operation** - Keep use cases focused
4. **Use API clients** - Don't call `fetch` directly from components
5. **Handle errors** - Always wrap API calls in try-catch
6. **Validate input** - Check data before processing
7. **Document changes** - Update docs when adding features

### ⚠️ Don't Do This

```javascript
// ❌ Don't instantiate use cases directly
const useCase = new UploadVideoUseCase(videoRepository)

// ✅ Use the container
const container = getContainer()
const useCase = container.getUseCase('uploadVideo')

// ❌ Don't call fetch directly from components
fetch('/api/upload-mux', { ... })

// ✅ Use API clients
VideoApiClient.uploadVideo(file)

// ❌ Don't access sessionStorage directly
sessionStorage.setItem('data', value)

// ✅ Use StorageService
StorageService.saveOrderData(data)

// ❌ Don't put business logic in components
function MyComponent() {
  const total = product.price * quantity * (1 + tax)
  // ... more calculations
}

// ✅ Put business logic in entities or use cases
function MyComponent() {
  const total = order.calculateTotal()
}
```

### 🚀 Getting Started Checklist

- [ ] Read `ARCHITECTURE.md` for complete overview
- [ ] Review `ARCHITECTURE_VISUAL.md` for diagrams
- [ ] Check `MIGRATION.md` if updating old code
- [ ] Look at existing entities to understand domain
- [ ] Look at existing use cases to understand operations
- [ ] Try adding a simple feature using the patterns above
- [ ] Write tests for your new feature

### 📞 Need Help?

1. Check the documentation files
2. Look at existing code for examples
3. Follow the patterns already established
4. Ask team members familiar with clean architecture

Happy coding! 🎉
