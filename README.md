# Role-Based Blog API

A robust backend API built with Fastify, Prisma, and TypeScript featuring role-based access control (RBAC) for a blogging platform.

## 🚀 Features

- **JWT Authentication** - Secure user authentication with JSON Web Tokens
- **Role-Based Access Control** - Three user roles with different permissions:
  - **READER**: View published posts only
  - **WRITER**: View all posts + create new posts
  - **ADMIN**: Full access - manage posts and user roles
- **RESTful API** - Clean and intuitive API design
- **TypeScript** - Full type safety throughout the application
- **Prisma ORM** - Type-safe database access with PostgreSQL
- **Request Validation** - Automatic input validation using Zod schemas with Fastify integration
- **API Documentation** - Auto-generated OpenAPI/Swagger documentation at `/docs`
- **Error Handling** - Comprehensive error handling with appropriate HTTP status codes
- **CORS Support** - Configurable CORS with origin allowlist
- **Security** - Password hashing with bcrypt, JWT token validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd role-based-blog-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```bash
cp env.example .env
```

Update the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/blog_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

4. **Set up the database**

Create a PostgreSQL database:
```bash
createdb blog_db
```

Run Prisma migrations:
```bash
npm run prisma:migrate
```

Generate Prisma Client:
```bash
npm run prisma:generate
```

5. **(Optional) Seed the database**
```bash
npm run prisma:seed
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the PORT specified in your `.env` file).

### Production Mode
```bash
npm run build
npm start
```

### API Documentation

Once the server is running, visit `http://localhost:3000/docs` to access the interactive Swagger UI documentation where you can:
- View all available endpoints
- See request/response schemas
- Test API endpoints directly from the browser
- Understand authentication requirements

The server will start on `http://localhost:3000` (or the PORT specified in your .env file).

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register a New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "READER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "READER"
  },
  "token": "jwt-token"
}
```

### Posts Endpoints

#### Get All Posts
```http
GET /api/posts
```

**Permissions:**
- Public/READER: Returns published posts only
- WRITER/ADMIN: Returns all posts

**Response (200):**
```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "Post Title",
      "content": "Post content...",
      "published": true,
      "authorId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": "uuid",
        "name": "John Doe",
        "email": "user@example.com"
      }
    }
  ]
}
```

#### Get Single Post
```http
GET /api/posts/:id
```

**Permissions:**
- Public/READER: Published posts only
- WRITER/ADMIN: All posts

**Response (200):**
```json
{
  "post": {
    "id": "uuid",
    "title": "Post Title",
    "content": "Post content...",
    "published": true,
    "authorId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

#### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My New Post",
  "content": "This is the content of my post",
  "published": false
}
```

**Permissions:** WRITER, ADMIN

**Response (201):**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": "uuid",
    "title": "My New Post",
    "content": "This is the content of my post",
    "published": false,
    "authorId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

#### Update Post
```http
PUT /api/posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "published": true
}
```

**Permissions:** ADMIN only

**Response (200):**
```json
{
  "message": "Post updated successfully",
  "post": {
    "id": "uuid",
    "title": "Updated Title",
    "content": "Updated content",
    "published": true,
    "authorId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

#### Delete Post
```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

**Permissions:** ADMIN only

**Response (200):**
```json
{
  "message": "Post deleted successfully"
}
```

### Users Endpoints (Admin Only)

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

**Permissions:** ADMIN only

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "READER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "posts": 5
      }
    }
  ]
}
```

#### Update User Role
```http
PATCH /api/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "WRITER"
}
```

**Permissions:** ADMIN only

**Possible roles:** READER, WRITER, ADMIN

**Response (200):**
```json
{
  "message": "User role updated successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "WRITER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🔐 Role Permissions

| Endpoint | READER | WRITER | ADMIN |
|----------|--------|--------|-------|
| GET /api/posts | ✅ (published only) | ✅ (all) | ✅ (all) |
| GET /api/posts/:id | ✅ (published only) | ✅ (all) | ✅ (all) |
| POST /api/posts | ❌ | ✅ | ✅ |
| PUT /api/posts/:id | ❌ | ❌ | ✅ |
| DELETE /api/posts/:id | ❌ | ❌ | ✅ |
| GET /api/users | ❌ | ❌ | ✅ |
| PATCH /api/users/:id/role | ❌ | ❌ | ✅ |

## 🔧 Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build the TypeScript project
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database with sample data

## 📁 Project Structure

```
role-based-blog-api/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeding script
├── src/
│   ├── config/
│   │   └── env.ts           # Environment configuration
│   ├── lib/
│   │   ├── auth.ts          # Password hashing utilities
│   │   └── prisma.ts        # Prisma client instance
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT authentication
│   │   └── roles.middleware.ts  # Role-based access control
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   ├── posts/
│   │   │   ├── posts.controller.ts
│   │   │   └── posts.service.ts
│   │   └── users/
│   │       ├── users.controller.ts
│   │       └── users.service.ts
│   ├── types/
│   │   └── index.ts         # TypeScript types/interfaces
│   ├── utils/
│   │   └── validation.ts    # Zod validation schemas
│   ├── app.ts               # Fastify app configuration
│   └── server.ts            # Server entry point
├── .gitignore
├── env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🛡️ Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
- **JWT Tokens**: Secure token-based authentication with 7-day expiration
- **CORS Protection**: Configurable origin allowlist
- **Input Validation**: All inputs validated using Zod schemas
- **SQL Injection Protection**: Prisma ORM prevents SQL injection attacks
- **Type Safety**: Full TypeScript coverage prevents type-related bugs

## 🐛 Error Responses

All error responses follow this format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": []  // Optional, for validation errors
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

## 🧪 Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Create Post (with token):**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My First Post",
    "content": "This is my first blog post!",
    "published": true
  }'
```


