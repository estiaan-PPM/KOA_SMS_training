
// README.md
# Koa Academy Student Management System

A comprehensive multi-tenant student management system built with NestJS, PostgreSQL, and Drizzle ORM.

## Features

- 🏫 **Multi-tenant Architecture** - Support for multiple school campuses
- 👥 **Comprehensive User Management** - Students, teachers, parents, and administrators
- 📚 **Academic Management** - Grade levels, subjects, assessments, and progress tracking
- 👨‍👩‍👧‍👦 **Family Management** - Complex family structures with multiple guardians
- 📊 **Assessment System** - Assignments, marks, and weighted calculations
- 📅 **Attendance Tracking** - Session-based attendance with multiple session types
- 🎯 **Learning Targets** - Sprint-based targets with external platform integration
- 🏆 **Badge System** - Achievement recognition and motivation
- 📋 **Audit System** - Comprehensive logging and change tracking
- 🔐 **Security** - JWT authentication, role-based access control, and tenant isolation

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd koa-academy-sms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start database with Docker**
   ```bash
   npm run docker:up
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Seed the database**
   ```bash
   npm run db:seed
   ```

7. **Start the application**
   ```bash
   npm run start:dev
   ```

## API Documentation

Visit http://localhost:3000/api/docs for interactive API documentation.

## Database Management

- **Generate migration**: `npm run db:generate`
- **Run migrations**: `npm run db:migrate`
- **View database**: `npm run db:studio`
- **Seed database**: `npm run db:seed`

## Architecture

### Multi-Tenant Design
- **School-based isolation**: All data is isolated by `schoolId`
- **Tenant context**: Automatic tenant filtering in all queries
- **Security**: Role-based access control with tenant boundaries

### Database Schema
- **Schools**: Multi-campus support
- **Users**: Unified user accounts with role-based access
- **Students**: Comprehensive student profiles with family relationships
- **Teachers**: Teacher management with academic assignments
- **Academic**: Grade levels, subjects, modules with flexible progression
- **Assessments**: Weighted marking system with moderation support
- **Attendance**: Session-based tracking with multiple session types
- **Audit**: Complete change tracking and user activity logs

## Default Users

After seeding, you can login with:

- **Admin**: admin@koa.edu.za / Admin123!
- **Teacher**: sarah.johnson@koa.edu.za / Teacher123!
- **Parent**: parent@smith.family / Parent123!

## Development

```bash
# Development
npm run start:dev

# Testing
npm run test
npm run test:e2e

# Linting
npm run lint

# Database
npm run db:studio  # Open Drizzle Studio
```

## Production Deployment

1. Set production environment variables
2. Build the application: `npm run build`
3. Run migrations: `npm run db:migrate`
4. Start production server: `npm run start:prod`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.