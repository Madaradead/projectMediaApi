# Secure Media API

A production-ready RESTful API for secure media file management.

## Features
- **Authentication**: JWT-based login and registration.
- **Media Management**: Upload, stream, soft-delete, and update metadata.
- **Security**: SQL Injection protection (Prisma), Rate limiting, File type filtering, Path Traversal prevention.
- **Docs**: Auto-generated Swagger UI.

## Tech Stack
Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM, Multer.

## Setup

1. Install dependencies:
npm install

2. Setup environment variables:
Copy .env.example to .env and fill in your database credentials.

3. Run migrations:
npx prisma migrate dev

4. Start server:
npx tsx src/server.ts

## Documentation
Available at http://localhost:5000/api-docs