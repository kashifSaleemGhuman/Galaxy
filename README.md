# Galaxy ERP System

A comprehensive, scalable Enterprise Resource Planning (ERP) system built with Next.js 15+, TypeScript, and modern web technologies.

## 🚀 Features

- **CRM Module**: Customer and lead management
- **Sales Management**: Product catalog and order processing
- **Inventory Management**: Stock tracking and warehouse management
- **HRM Module**: Employee and department management
- **Accounting & Financial Management**: Chart of accounts and journal entries
- **Analytics & Dashboard**: Comprehensive reporting and insights
- **Multi-tenant Architecture**: Support for multiple organizations
- **Role-based Access Control**: Secure permission system
- **Responsive Design**: Mobile-first approach with WCAG 2.1 AA compliance

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.5.0, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest + React Testing Library

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Redis (for caching and sessions)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd galaxy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Update `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/galaxy_erp"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
```

### 4. Start Postgres and Redis

#### Option A) With docker-compose (recommended)

```bash
docker compose up -d postgres redis
```

Use `docker compose ps` to verify both services are healthy.

#### Option B) Without docker-compose

If `docker-compose` is not available, you can run the infrastructure directly with `docker run`:

```bash
# Postgres
docker run -d --name galaxy-postgres \
  -e POSTGRES_DB=galaxy_erp \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -v "$PWD/postgres_data":/var/lib/postgresql/data \
  -v "$PWD/init.sql":/docker-entrypoint-initdb.d/init.sql \
  postgres:15-alpine

# Redis
docker run -d --name galaxy-redis \
  -p 6379:6379 \
  -v "$PWD/redis_data":/data \
  redis:7-alpine

# If containers already exist (created earlier), just start them:
docker start galaxy-postgres || true
docker start galaxy-redis || true
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API endpoints
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── modules/          # Module-specific components
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores
└── types/                # TypeScript definitions
```

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:studio       # Open Prisma Studio
npx prisma studio       # Open Prisma Studio directly
npm run db:seed         # Seed database

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report

# Linting
npm run lint            # Run ESLint
```

## 🗄️ Database Schema

The system uses a comprehensive database schema with the following core entities:

- **Users & Authentication**: Multi-tenant user management
- **CRM**: Customers, leads, and opportunities
- **Sales**: Products, orders, and pricing
- **Inventory**: Stock items and movements
- **HRM**: Employees, departments, and positions
- **Accounting**: Chart of accounts and journal entries

## 🔐 Authentication & Authorization

- JWT-based authentication with NextAuth.js
- Role-based access control (RBAC)
- Permission-based authorization
- Multi-tenant isolation
- Secure password hashing with bcrypt

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS for styling
- WCAG 2.1 AA accessibility compliance
- Cross-browser compatibility

## 🧪 Testing Strategy

- **Unit Testing**: Jest + React Testing Library
- **Integration Testing**: API and database testing
- **E2E Testing**: Playwright for user workflows
- **Performance Testing**: Load and stress testing

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t galaxy-erp .

# Run container
docker run -p 3000:3000 galaxy-erp
```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL="your-production-db-url"
REDIS_URL="your-production-redis-url"
NEXTAUTH_SECRET="your-production-secret"
```

## 📊 Performance Optimization

- Code splitting and lazy loading
- Image optimization with Next.js Image
- Database query optimization
- Redis caching strategies
- CDN integration for static assets

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Regular security audits

## 📈 Monitoring & Analytics

- Application performance monitoring
- Error tracking and alerting
- User activity analytics
- Business intelligence dashboards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the architecture and technical implementation plans

## 🗺️ Roadmap

See [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md) for detailed development phases and timeline.

## 📚 Documentation

- [System Architecture](docs/ARCHITECTURE.md)
- [Technical Implementation](docs/TECHNICAL_IMPLEMENTATION.md)
- [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md)

---

Built with ❤️ using Next.js and modern web technologies.
