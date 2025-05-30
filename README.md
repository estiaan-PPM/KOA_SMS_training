# NestJS Starter

A comprehensive NestJS starter repository with authentication, database integration using Drizzle ORM, validation, error handling, and other best practices.

## Features

- 🚀 **NestJS Framework** - A progressive Node.js framework
- 🔐 **Authentication & Authorization** - JWT-based auth with refresh tokens
- 🗄️ **Database Integration** - PostgreSQL with Drizzle ORM
- 📝 **API Documentation** - Swagger/OpenAPI integration
- ✅ **Validation** - Input validation with class-validator
- 🔒 **Security** - Helmet for security headers, rate limiting
- 🐳 **Docker Support** - Docker Compose for development
- 📊 **Health Checks** - Database and application health monitoring
- 🧪 **Testing Setup** - Jest configuration for unit and integration tests
- 📚 **Code Quality** - ESLint, Prettier, and TypeScript strict mode

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd nestjs-starter
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the database**
```bash
docker-compose up -d postgres
```

5. **Run database migrations**
```bash
npm run db:generate
npm run db:migrate
```

6. **Start the application**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the API documentation at:
- Swagger UI: http://localhost:3000/api/docs

## Database Management

### Drizzle Commands

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

### Database Access

- **PostgreSQL**: localhost:5432
- **pgAdmin**: http://localhost:5050
  - Email: admin@admin.com
  - Password: admin

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # Auth guards
│   ├── interfaces/      # TypeScript interfaces
│   └── strategies/      # Passport strategies
├── common/              # Shared utilities
│   ├── filters/         # Exception filters
│   └── utils/           # Utility functions
├── database/            # Database configuration
│   ├── schema.ts        # Drizzle schema definitions
│   └── *.ts            # Database-related files
├── health/              # Health check module
├── posts/               # Posts feature module
├── users/               # Users module
└── main.ts             # Application entry point
```

## Available Scripts

```bash
# Development
npm run start:dev        # Start in watch mode
npm run start:debug      # Start in debug mode

# Building
npm run build           # Build the application
npm run start:prod      # Start production build

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:cov        # Run tests with coverage
npm run test:e2e        # Run end-to-end tests

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier

# Database
npm run db:generate     # Generate database migrations
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Drizzle Studio
```

## Authentication

The starter includes a complete authentication system:

- **Registration**: POST `/auth/register`
- **Login**: POST `/auth/login`
- **Logout**: POST `/auth/logout`
- **Profile**: GET `/auth/me`
- **Refresh Token**: GET `/auth/refresh`

### Usage Example

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe", "password": "password123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Configurable request throttling
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Automatic request validation
- **Error Handling**: Comprehensive error management

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `POSTGRES_HOST` | Database host | `localhost` |
| `POSTGRES_PORT` | Database port | `5432` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `password` |
| `POSTGRES_DB` | Database name | `nestjs_db` |
| `JWT_ACCESS_TOKEN_SECRET` | JWT access token secret | - |
| `JWT_ACCESS_TOKEN_EXPIRATION_TIME` | Access token expiry (seconds) | `900` |
| `JWT_REFRESH_TOKEN_SECRET` | JWT refresh token secret | - |
| `JWT_REFRESH_TOKEN_EXPIRATION_TIME` | Refresh token expiry (seconds) | `604800` |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Based on the comprehensive NestJS course materials covering:
- Authentication and authorization
- Database integration with Drizzle ORM
- API documentation with Swagger
- Security best practices
- Testing strategies
- Error handling and validation