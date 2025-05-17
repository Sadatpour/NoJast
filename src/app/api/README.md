# API Documentation

## Authentication

### POST /api/auth/login
Authenticates a user and returns a session token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "created_at": "string"
  },
  "session": {
    "access_token": "string",
    "refresh_token": "string"
  }
}
```

### POST /api/auth/signup
Creates a new user account.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "created_at": "string"
  }
}
```

## Products

### GET /api/products
Returns a list of products.

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `category` (optional): Filter by category
- `search` (optional): Search term

**Response:**
```json
{
  "products": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "category": "string",
      "created_at": "string",
      "updated_at": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

### POST /api/products
Creates a new product.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "category": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "created_at": "string"
}
```

### GET /api/products/:id
Returns a specific product by ID.

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

### PUT /api/products/:id
Updates a specific product.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "category": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "updated_at": "string"
}
```

### DELETE /api/products/:id
Deletes a specific product.

**Response:**
```json
{
  "success": true
}
```

## Error Responses

All API endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "string",
  "message": "string"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
``` 