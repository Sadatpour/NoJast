import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

describe('Products API', () => {
  const mockRequest = new NextRequest('http://localhost:3000/api/products')
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('returns products successfully', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' }
      ]

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockProducts, error: null })
      }

      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockProducts)
    })

    it('handles database errors', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
      }

      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('POST /api/products', () => {
    const mockProduct = {
      name: 'Test Product',
      description: 'Test Description',
      category: 'Test Category'
    }

    it('creates product successfully', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ data: { id: 1, ...mockProduct }, error: null })
      }

      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(mockProduct)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual({ id: 1, ...mockProduct })
    })

    it('handles validation errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })
}) 