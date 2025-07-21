# HustCode Backend

Backend API for HustCode application built with NestJS framework, using Prisma ORM and PostgreSQL database.

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (Access Token + Refresh Token)
- **Language**: TypeScript
- **Package Manager**: Yarn

## Installation and Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Environment Configuration

Create `.env` file from the example and update the values:

```bash
cp .env.example .env
```

Edit the `.env` file with your database information and JWT secrets.

### 3. Database Setup

Run migration to create database schema:

```bash
yarn prisma migrate dev
```

### 4. Run the Application

```bash
# Development mode
yarn start:dev

# Production mode  
yarn start:prod

# Build project
yarn build
```

The application will run at `http://localhost:4000`

## Useful Scripts

```bash
# View database schema
yarn prisma studio

# Sync database schema (alternative to migration)
yarn prisma db push

# Reset database
yarn prisma migrate reset

# Generate Prisma client
yarn prisma generate

# Run tests
yarn test

# E2E tests
yarn test:e2e
```

## Database Schema

See detailed schema at `prisma/schema.prisma`
